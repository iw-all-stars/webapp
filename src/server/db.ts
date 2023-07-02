import { type PrismaClient } from "@prisma/client";
import prismaInstance from './client.prisma';

import { env } from "../env.mjs";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const prismaClient =
    globalForPrisma.prisma ??
    prismaInstance

export const prisma = prismaClient;

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
