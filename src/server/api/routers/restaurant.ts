import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const restaurantRouter = createTRPCRouter({

  add: publicProcedure
    .input(
      z.object({
        name: z.string(),
        categoryId: z.string(),
        address: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        organizationId: z.string()
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.restaurant.create({ data: input });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        categoryId: z.string(),
        address: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        organizationId: z.string()
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.restaurant.update({
        where: { id },
        data: data 
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.restaurant.findMany();
  }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.restaurant.findUnique({
        where: {
          id: input.id
        }
      });
    }),

  getByOrganizationId: publicProcedure
    .input(
      z.object({
        organizationId: z.string()
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.restaurant.findMany({
        where: {
          organizationId: input.organizationId
        }
      });
    })

});
