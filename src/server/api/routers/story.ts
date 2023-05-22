import { PostType, StoryStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
        publishedAt: z.string().optional(),
        status: z.enum([StoryStatus.DRAFT, StoryStatus.SCHEDULED, StoryStatus.NOW]),
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

export type CreatePost = z.infer<typeof createPost>;

export type CreateStory = z.infer<typeof createStory>;

export const storyRouter = createTRPCRouter({
    create: publicProcedure
        .input(createStory)
        .mutation(async ({ ctx, input }) => {

            const posts = await ctx.prisma.post.findMany({
                where: {
                    id: {
                        in: input.posts.map((post) => post.id),
                    },
                },
            })
            
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
                })
            }

            await Promise.all(
                input.posts.map((post) => {
                    return ctx.prisma.post.update({
                        where: {
                            id: post.id,
                        },
                        data: {
                            position: post.position,
                        },
                    });
                    }
                )
            )
            return ctx.prisma.story.create({
                data: {
                    name: input.name,
                    publishedAt: input.publishedAt
                        ? new Date(input.publishedAt)
                        : undefined,
                    status: input.status,
                    posts: {
                        connect: input.posts.map((post) => ({
                            id: post.id,
                        })),
                    },
                },
            });
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.story.delete({
                where: {
                    id: input.id,
                },
            });
        }),

    getAll: publicProcedure
        .query(({ ctx }) => {
            return ctx.prisma.story.findMany({
                orderBy: {
                    createdAt: "desc",
                },
            });
        })
});
