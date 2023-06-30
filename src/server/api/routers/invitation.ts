import { TRPCError } from "@trpc/server";
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

      const currentInvitation = await ctx.prisma.invitation.findUnique({
        where: { id: invitationId }
      });

      if (currentInvitation?.receiverId !== ctx.session?.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to change this invitation status"
        })
      }

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

      return await ctx.prisma.invitation.delete({
        where: { id: invitationId }
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
          receiverId: ctx.session?.user.id
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
