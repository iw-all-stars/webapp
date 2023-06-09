import { PostType, type Restaurant, StoryStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { DateTime } from "luxon";
import { z } from "zod";
import { createTRPCRouter, hasAccessToRestaurantProcedure, hasAccessToOrganizationProcedure } from "~/server/api/trpc";
import { StoryStatusHandler } from "~/server/services/storyStatusHandler.service";

const createPost = z.object({
    id: z.string(),
    originalUrl: z.string(),
    name: z.string(),
    position: z.number().int().gte(0).nullable(),
    type: z.enum([PostType.IMAGE, PostType.VIDEO]),
});

const createStory = z
    .object({
        name: z.string(),
        posts: z.array(createPost).min(1),
        publishedAt: z
            .string()
            .optional()
            .refine(
                (data) => {
                    if (
                        data &&
                        DateTime.fromJSDate(new Date(data)) <
                            DateTime.fromJSDate(new Date())
                    ) {
                        return false;
                    }
                    return true;
                },
                {
                    message: "invalid publishedAt date, must be in the future",
                }
            ),
        status: z.enum([
            StoryStatus.DRAFT,
            StoryStatus.SCHEDULED,
            StoryStatus.NOW,
        ]),
        platformId: z.string(),
    })
    .refine(
        (data) => {
            if (!data.publishedAt) {
                return data.status === StoryStatus.DRAFT;
            }
            return true;
        },
        {
            message: "publishedAt must be undefined when status is DRAFT",
        }
    );

const searchStories = z
    .object({
        name: z.string().optional(),
        dates: z
            .object({
                startDate: z.string().optional(),
                endDate: z.string().optional(),
            })
            .optional(),
    })
    .optional();

export type CreatePost = z.infer<typeof createPost>;

export type CreateStory = z.infer<typeof createStory>;

export type SearchStories = z.infer<typeof searchStories>;

export const storyRouter = createTRPCRouter({
    upsert: hasAccessToRestaurantProcedure
        .input(
            z.object({
                id: z.string().optional(),
                data: createStory,
            })
        )
        .mutation(async ({ ctx, input }) => {
            const posts = await ctx.prisma.post.findMany({
                where: {
                    id: {
                        in: input.data.posts.map((post) => post.id),
                    },
                },
            });

            const notConvertedPosts = [];
            for (const post of posts) {
                if (!post.convertedUrl) {
                    notConvertedPosts.push(post);
                }
            }

            if (notConvertedPosts.length > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Some posts are not converted yet",
                    cause: {
                        posts: notConvertedPosts,
                    },
                });
            }

            await Promise.all(
                input.data.posts.map((post) => {
                    return ctx.prisma.post.update({
                        where: {
                            id: post.id,
                        },
                        data: {
                            position: post.position,
                        },
                    });
                })
            );

            let publishedAt = undefined;

            if (input.data.status === StoryStatus.NOW) {
                publishedAt = DateTime.fromJSDate(new Date())
                    .plus({ minutes: 1 })
                    .toJSDate();
            } else if (input.data.status === StoryStatus.SCHEDULED) {
                publishedAt = new Date(input.data.publishedAt as string);
            }

            if (!input.id) {
                const newStory = await ctx.prisma.story.create({
                    data: {
                        name: input.data.name,
                        publishedAt: publishedAt,
                        status: input.data.status,
                        platformId: input.data.platformId,
                        posts: {
                            connect: input.data.posts.map((post) => ({
                                id: post.id,
                            })),
                        },
                    },
                });
                const handler = new StoryStatusHandler(newStory.id, "create");
                await handler.handle();
                return newStory;
            }
            const storyUpdated = await ctx.prisma.story.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.data.name,
                    publishedAt: publishedAt,
                    status: input.data.status,
                    posts: {
                        set: input.data.posts.map((post) => ({
                            id: post.id,
                        })),
                    },
                },
            });
            const handler = new StoryStatusHandler(storyUpdated.id, "update");
            await handler.handle();
            return storyUpdated;
        }),

    delete: hasAccessToRestaurantProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
			const handler = new StoryStatusHandler(input.id, "delete");
            await handler.handle();
            return ctx.prisma.story.delete({
                where: {
                    id: input.id,
                },
            });
        }),

    getAll: hasAccessToRestaurantProcedure.input(searchStories).query(({ ctx, input }) => {
        let where = {};
        if (input?.name) {
            where = {
                name: {
                    contains: input.name.trim().toLocaleLowerCase(),
                    mode: "insensitive",
                },
            };
        }

        if (input?.dates?.startDate && input?.dates?.endDate) {
            where = {
                ...where,
                publishedAt: {
                    gte: new Date(input.dates.startDate),
                    lte: new Date(input.dates.endDate),
                },
            };
        }

        return ctx.prisma.story.findMany({
            where: {
				platformId: {
					in: ctx.restaurant.platforms.map((platform) => platform.id)
				},
				...where,
			},
            orderBy: {
                publishedAt: "desc",
            },
            include: {
                posts: {
                    orderBy: {
                        position: "asc",
                    },
                },
                platform: {
                    select: {
                        key: true,
                        createdAt: true,
                        updatedAt: true,
                        id: true,
                        login: true,
                        restaurantId: true,
                    },
                },
            },
        });
    }),


    getCountByRestaurant: hasAccessToOrganizationProcedure
        .query(async ({ ctx }) => {

            const restaurantsOfOrganization = await ctx.prisma.restaurant.findMany({
                where: {
                    organizationId: ctx.userToOrga.organizationId,
                },
            });

            const platformsOfOrganizationWithStories = await ctx.prisma.platform.findMany({
                where: {
                    restaurantId: {
                        in: restaurantsOfOrganization.map((restaurant) => restaurant.id),
                    }
                },
                include: {
                    stories: true,
                },
            });

            const restaurants = platformsOfOrganizationWithStories.flatMap(platform => {
                const currentRestaurant = restaurantsOfOrganization.find(restaurant => restaurant.id === platform.restaurantId) as Restaurant;
                return {
                    restaurantName: currentRestaurant.name,
                    createdAt: currentRestaurant.createdAt,
                    count: platform.stories.length
                }
            });

            const restaurantsWithoutStories = restaurantsOfOrganization.filter(restaurant => 
                !platformsOfOrganizationWithStories.find(platform => platform.restaurantId === restaurant.id)
            );

            const restaurantsWithoutStoriesData = restaurantsWithoutStories.map(restaurant => ({
                restaurantName: restaurant.name,
                createdAt: restaurant.createdAt,
                count: 0
            }));

            const dataToReturn = [...restaurants, ...restaurantsWithoutStoriesData];

            dataToReturn.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            return dataToReturn;
        })
});
