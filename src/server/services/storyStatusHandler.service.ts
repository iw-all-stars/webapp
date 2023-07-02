import { StoryStatus } from "@prisma/client";
import { deleteStorySchedule, scheduleStory } from "./storyScheduler.service";
import { isElapsedTimesBetweenDatesGreaterThanDuration } from "../../utils/date";
import { Duration } from "luxon";
import { IgApiClient } from "instagram-private-api";
import { decrypt } from "../../utils/decrypte-password";
import { prisma } from "../db";


type Method = "delete" | "create" | "update";

export class StoryStatusHandler {
    private storyId: string;
    private method: Method;
    constructor(storyId: string, method: Method) {
        this.storyId = storyId;
        this.method = method;
    }

    handle(): Promise<void> {
        switch (this.method) {
            case "delete":
                return this._handleDelete();
            case "create":
            case "update":
                return this._handleCreateOrUpdate();
        }
    }

    async _handleCreateOrUpdate(): Promise<void> {
        const storyWithPosts = await prisma.story.findUnique({
            where: {
                id: this.storyId,
            },
            include: {
                posts: true,
                platform: true,
            },
        });

        try {
            await deleteStorySchedule(this.storyId);
        } catch (_) {
            console.log("no schedule to delete");
        }

        if (
            storyWithPosts &&
            storyWithPosts?.publishedAt &&
            storyWithPosts?.status !== StoryStatus.DRAFT
        ) {
            const platform = await prisma.platform.findFirst({
                where: {
                    id: storyWithPosts.platformId,
                },
                include: {
                    restaurant: true,
                },
            });
            const restaurantWithOrga = await prisma.restaurant.findFirst({
                where: {
                    id: platform?.restaurantId,
                },
                include: {
                    organization: true,
                },
            });

            if (restaurantWithOrga) {
                await scheduleStory(storyWithPosts, restaurantWithOrga);
            }
        }
    }

    async _handleDelete(): Promise<void> {
        const story = await prisma.story.findUnique({
            where: {
                id: this.storyId,
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
}
