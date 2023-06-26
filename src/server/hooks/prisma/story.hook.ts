/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
	StoryStatus,
	type Prisma,
	type PrismaClient,
	type Story,
} from "@prisma/client";
import { IgApiClient } from "instagram-private-api";
import { Duration } from "luxon";
import {
	deleteStorySchedule,
	scheduleStory,
} from "~/server/services/storyScheduler.service";
import { isElapsedTimesBetweenDatesGreaterThanDuration } from "~/utils/date";
import { decrypt } from "~/utils/decrypte-password";
import { type Hook } from "../setup.hook";

export class StoryHook implements Hook {
    useHook(
        prismaClient: PrismaClient<
            Prisma.PrismaClientOptions,
            never,
            Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
        >
    ) {
        prismaClient.$use(async (params, next) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const result = await next(params);
            if (
                params.model == "Story" &&
                ["create", "update"].includes(params.action)
            ) {
                const storyWithPosts = await prismaClient.story.findUnique({
                    where: {
                        id: (result as Story).id,
                    },
                    include: {
                        posts: true,
                        platform: true,
                    },
                });

				try {
					await deleteStorySchedule((result as Story).id);
				} catch (_) {
					console.log('no schedule to delete');
				}

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (
                    storyWithPosts &&
                    (result as Partial<Story>)?.publishedAt &&
                    (result as Partial<Story>)?.status !== StoryStatus.DRAFT
                ) {
					const platform = await prismaClient.platform.findFirst({
						where: {
							id: storyWithPosts.platformId,
						},
						include: {
							restaurant: true,
						},
					});
					const restaurantWithOrga = await prismaClient.restaurant.findFirst({
						where: {
							id: platform?.restaurantId,
						},
						include: {
							organization: true,
						},
					})

					if (restaurantWithOrga) {
						await scheduleStory(storyWithPosts, restaurantWithOrga);
					}

                }
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return result;
        });

        prismaClient.$use(async (params, next) => {
            if (params.model == "Story" && ["delete"].includes(params.action)) {
                const storyId = params.args.where.id as string;
                const story = await prismaClient.story.findUnique({
                    where: {
                        id: storyId,
                    },
                    include: {
                        platform: true,
                        posts: true,
                    },
                });

                if (story?.status === StoryStatus.SCHEDULED) {
                    await deleteStorySchedule(story.id);
                }

                if (
                    story?.status === StoryStatus.PUBLISHED &&
                    !isElapsedTimesBetweenDatesGreaterThanDuration(
                        new Date(story.publishedAt as unknown as string),
                        new Date(),
                        Duration.fromObject({
                            hours: 24,
                        })
                    )
                ) {
                    const ig = new IgApiClient();
                    ig.state.generateDevice(story.platform.login);

                    await ig.account.login(
                        story.platform.login,
                        decrypt(story.platform.password)
                    );

                    await Promise.all(
                        story.posts.map(async (post) =>
                            ig.media.delete({
                                mediaId: post.socialPostId as string,
                            })
                        )
                    );
                }
            }
            return next(params);
        });
    }
}
