import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({

  getAll: publicProcedure.query(({ ctx }) => {
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

  getByOrganizationId: publicProcedure
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
  })

});

export default userRouter;
