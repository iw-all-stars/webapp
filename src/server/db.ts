import { PrismaClient } from "@prisma/client";

import { env } from "~/env.mjs";
import { setupHooks } from "./hooks/setup.hook";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const prismaClient =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });

setupHooks(prismaClient);

export const prisma = prismaClient;

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
