import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: {
        organizations: {
          include: {
            organization: true
          }
        },
      },
    });
  }),

  getByOrganizationId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          organizations: {
            some: {
              organizationId: input.id,
            }
          }
        },
      });
  }),


  getCurrent: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      include: {
        organizations: {
          include: {
            organization: true,
            user: true,
          }
        },
      },
    });
  })

});

export default userRouter;
