import { type Prisma, type PrismaClient } from "@prisma/client";
import { StoryHook } from "./prisma/stories.hook";

export interface Hook {
    useHook: (
        prismaClient: PrismaClient<
            Prisma.PrismaClientOptions,
            never,
            Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
        >
    ) => void;
}

export const setupHooks = (
    prisma: PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >
) => {
    new StoryHook().useHook(prisma);
};
