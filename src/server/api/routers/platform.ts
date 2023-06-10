import { PlatformKey } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const createPlatform = z.object({
    login: z.string(),
    password: z.string(),
    key: z.enum([
		PlatformKey.FACEBOOK,
		PlatformKey.INSTAGRAM,
		PlatformKey.TIKTOK,
		PlatformKey.TWITTER,
	]),
    restaurantId: z.string(),
});

const updatePlatform = z.object({
    id: z.string(),
    login: z.string(),
    password: z.string(),
});

export type CreatePlatform = z.infer<typeof createPlatform>;

export const platformRouter = createTRPCRouter({
    create: publicProcedure
        .input(createPlatform)
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.platform.create({
                data: {
                    login: input.login,
                    password: input.password,
                    key: input.key,
                    restaurant: {
                        connect: {
                            id: input.restaurantId,
                        },
                    },
                },
            });
        }),

    updateById: publicProcedure.input(updatePlatform).mutation(async ({ ctx, input }) => {
        return ctx.prisma.platform.update({
            where: {
                id: input.id,
            },
            data: {
                login: input.login,
                password: input.password,
            },
        });
    }),

    deleteById: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.platform.delete({
                where: {
                    id: input.id,
                },
            });
        }),

    getAllByRestaurantId: publicProcedure
        .input(z.string())
        .query(({ ctx, input }) => {
            return ctx.prisma.platform.findMany({
                where: {
                    restaurantId: input,
                },
            });
        }),
});
