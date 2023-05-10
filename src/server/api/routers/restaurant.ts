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
        organizationId: z.string()
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.restaurant.create({ data: input });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.restaurant.findMany();
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
