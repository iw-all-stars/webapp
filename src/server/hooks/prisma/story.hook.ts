import { type Prisma, type PrismaClient, type Story } from "@prisma/client";
import { scheduleStory } from "~/server/services/storyScheduler.service";
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
            console.log("hello");
            if (params.model == "Story" && ["create", "update"].includes(params.action)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const storyWithPosts = await prismaClient.story.findUnique({
                    where: {
                        id: (result as Story).id,
                    },
                    include: {
                        posts: true,
                    },
                });

                if (storyWithPosts && storyWithPosts.publishedAt) {
                    await scheduleStory(storyWithPosts);
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return result
        });
    }
}
