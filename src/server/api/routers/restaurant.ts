import { z } from "zod";

import { createTRPCRouter, hasAccessToRestaurantProcedure, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const restaurantRouter = createTRPCRouter({
    add: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                categoryId: z.string(),
                address: z.string(),
                latitude: z.number(),
                longitude: z.number(),
                organizationId: z.string(),
            })
        )
        .mutation(({ ctx, input }) => {
            return ctx.prisma.restaurant.create({ data: input });
        }),

    update: hasAccessToRestaurantProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string(),
                categoryId: z.string(),
                address: z.string(),
                latitude: z.number(),
                longitude: z.number(),
                organizationId: z.string(),
            })
        )
        .mutation(({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.restaurant.update({
                where: { id },
                data: data,
            });
        }),

    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.restaurant.findMany();
    }),

    getById: hasAccessToRestaurantProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(({ ctx, input }) => {
            return ctx.prisma.restaurant.findUnique({
                where: {
                    id: input.id,
                },
            });
        }),

    getByOrganizationId: publicProcedure
        .input(
            z.object({
                organizationId: z.string(),
            })
        )
        .query(({ ctx, input }) => {
            return ctx.prisma.restaurant.findMany({
                where: {
                    organizationId: input.organizationId,
                },
            });
        }),

    userHasAccessToRestaurant: publicProcedure
        .input(
            z.object({
                restaurantId: z.string(),
                organizationId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const userToOrga = await ctx.prisma.usersOnOrganizations.findFirst({
                where: {
                    organizationId: input.organizationId,
					userId: ctx.session?.user.id
                },
            });

			if (!userToOrga) {
				return false;
			}

			const restaurant = await ctx.prisma.restaurant.findFirst({
				where: {
					id: input.restaurantId,
					organizationId: input.organizationId
				}
			});

			return !!restaurant;
        })
});
