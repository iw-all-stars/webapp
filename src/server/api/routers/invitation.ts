import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const invitationRouter = createTRPCRouter({

  add: publicProcedure
    .input(
      z.object({
        receiverId: z.string(),
        senderId: z.string(),
        organizationId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.invitation.create({
        data: {
          status: "PENDING",
          ...input
        }
      });
    }
  ),

  changeStatus: publicProcedure
    .input(
      z.object({
        invitationId: z.string(),
        organizationId: z.string(),
        status: z.enum(["ACCEPTED", "REJECTED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { invitationId, organizationId, status } = input;

      // check if invitation exists and user id matches as user id of invitation

      if (status === "ACCEPTED") {
        await ctx.prisma.organization.update({
          where: { id: organizationId },
          data: {
            users: {
              connect: {
                id: ctx.session?.user.id
              }
            }
          }
        });
      }

      return await ctx.prisma.invitation.update({
        where: { id: invitationId },
        data: {
          status,
        }
      });
    }
  ),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.invitation.findMany();
  }),

  getByCurrentUser: publicProcedure
    .query(({ ctx }) => {
      return ctx.prisma.invitation.findMany({
        where: {
          OR: [
            { receiverId: ctx.session?.user.id },
            { senderId: ctx.session?.user.id }
          ]
        },
        include: {
          sender: true,
          receiver: true,
          organization: true
        }
      });
    }),

});

export default invitationRouter;
