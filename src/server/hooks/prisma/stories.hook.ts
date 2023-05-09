import { type Post, type Prisma, type PrismaClient, type Story } from "@prisma/client";
import { type Hook } from "../setup.hook";
import { scheduleStory } from "~/server/services/storyScheduler.service";

export class StoryHook implements Hook {
    useHook(
        prismaClient: PrismaClient<
            Prisma.PrismaClientOptions,
            never,
            Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
        >
    ) {
        prismaClient.$use(async (params, next) => {
            if (params.model == "Story" && params.action == "create") {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const story = params.args.data as Story & { posts: Post[] };

                if (story.publishedAt) {
                    await scheduleStory(story);
                }
            }
            return next(params);
        });
    }
}
