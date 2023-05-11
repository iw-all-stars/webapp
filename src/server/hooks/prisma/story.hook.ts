import {
    StoryStatus,
    type Prisma,
    type PrismaClient,
    type Story,
} from "@prisma/client";
import {
    deleteStorySchedule,
    scheduleStory,
} from "~/server/services/storyScheduler.service";
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
                    },
                });

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (storyWithPosts && (params.args.data as Partial<Story>)?.publishedAt) {
                    await scheduleStory(storyWithPosts);
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return result;
        });

        prismaClient.$use(async (params, next) => {
            if (params.model == "Story" && ["delete"].includes(params.action)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const storyId = (params.args.where.id as string)
                const story = await prismaClient.story.findUnique({
                    where: {
                        id: storyId
                    },
                });

                if (story?.status === StoryStatus.SCHEDULED) {
                    await deleteStorySchedule(story.id);
                }
            }
            return next(params);
        })
    }
}
