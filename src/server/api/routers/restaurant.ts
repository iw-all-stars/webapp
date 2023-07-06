import { z } from "zod";

import {
  createTRPCRouter,
  hasAccessToRestaurantProcedure,
  isAdminOfOrganizationProcedure,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { RestaurantModel } from "~/server/mongoose";

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
    .mutation(async ({ ctx, input }) => {
      const restaurant = await ctx.prisma.restaurant.create({
        data: input,
        include: { category: true },
      });
      await RestaurantModel.create({
        _id: restaurant.id,
        categoryId: restaurant.categoryId,
        categoryName: restaurant.category?.name,
        name: restaurant.name,
        address: restaurant.address,
        organizationId: restaurant.organizationId,
        location: [restaurant.longitude, restaurant.latitude],
        isProspect: false,
      });

      return restaurant;
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
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const restaurant = await ctx.prisma.restaurant.update({
        where: { id },
        data: data,
        include: { category: true },
      });
      await RestaurantModel.updateOne(
        { _id: id },
        {
          location: [restaurant.longitude, restaurant.latitude],
          categoryId: restaurant.categoryId,
          categoryName: restaurant.category?.name,
          name: restaurant.name,
          address: restaurant.address,
          organizationId: restaurant.organizationId,
          isProspect: false,
        }
      );

      return restaurant;
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
          userId: ctx.session?.user.id,
        },
      });

      if (!userToOrga) {
        return false;
      }

      const restaurant = await ctx.prisma.restaurant.findFirst({
        where: {
          id: input.restaurantId,
          organizationId: input.organizationId,
        },
      });

      return !!restaurant;
    }),

	deleteById: isAdminOfOrganizationProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			await RestaurantModel.deleteOne({ _id: input.id });
			const restaurant = await ctx.prisma.restaurant.findUnique({
				where: {
					id: input.id,
				},
				include: {
					organization: {
						include: {
							restaurants: true,
						}
					},
				}
			});

			if (restaurant?.organization?.restaurants.length === 1) {
				await ctx.prisma.organization.delete({
					where: {
						id: restaurant.organizationId,
					},
				});
			} else {
				await ctx.prisma.restaurant.delete({
					where: {
						id: input.id,
					},
				});
			}
			return true;
		}
	),
});
