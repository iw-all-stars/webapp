import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const organizationRouter = createTRPCRouter({

  add: publicProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string()
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.organization.create({ data: input });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.organization.findMany();
  }),

  getByUserId: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.organization.findMany({
      where: {
        userId: ctx.session?.user.id,
      }
    });
  }),

});
