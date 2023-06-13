import { PlatformKey } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { IgApiClient } from "instagram-private-api";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { encrypt } from "~/utils/decrypte-password";

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

			await igLogin(input.key, input.login, input.password);

            return ctx.prisma.platform.create({
                data: {
                    login: input.login,
                    password: encrypt(input.password),
                    key: input.key,
                    restaurant: {
                        connect: {
                            id: input.restaurantId,
                        },
                    },
                },
            });
        }),

    updateById: publicProcedure
        .input(updatePlatform)
        .mutation(async ({ ctx, input }) => {


			const platform = await ctx.prisma.platform.findUnique({
				where: {
					id: input.id,
				},
				select: {
					key: true,
				},
			});

			if (!platform) {
				throw new Error("Platform not found");
			}
			
			await igLogin(platform.key, input.login, input.password);

            return ctx.prisma.platform.update({
                where: {
                    id: input.id,
                },
                data: {
                    login: input.login,
                    password: encrypt(input.password),
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
				select: {
					id: true,
					key: true,
					login: true,
					restaurantId: true,
					createdAt: true,
					updatedAt: true,
				}
            });
        }),
});

async function igLogin(
    platformKey: PlatformKey,
    username: string,
    password: string
) {
	try {
		switch (platformKey) {
			case PlatformKey.INSTAGRAM:
				const ig = new IgApiClient();
				ig.state.generateDevice(username);
				await ig.account.login(username, password);
				break;
			default:
				throw new Error("Invalid platform key connection");
		}
	} catch (error) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "wrong login or password",
		});
	}
}
