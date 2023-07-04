import { z } from "zod";

import {
  createTRPCRouter,
  hasAccessToRestaurantProcedure,
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
      const restaurant = await ctx.prisma.restaurant.create({ data: input });
      await RestaurantModel.create({
        _id: restaurant.id,
        categoryId: restaurant.categoryId,
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
      });
      await RestaurantModel.updateOne(
        { _id: id },
        {
          location: [restaurant.longitude, restaurant.latitude],
          ...data,
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
});
