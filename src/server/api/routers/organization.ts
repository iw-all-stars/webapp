import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const organizationRouter = createTRPCRouter({
  add: publicProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.organization.create({ data: input });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.organization.update({
        where: { id },
        data: data 
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.organization.findMany();
  }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.organization.findUnique({
        where: {
          id: input.id
        }
      });
    }),

  getByUserId: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.organization.findMany({
      where: {
        userId: ctx.session?.user.id,
      },
      include: {
        restaurants: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: "asc",
      }
    });
  }),
});

export default organizationRouter;
