import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, hasAccessToOrganizationProcedure, isAdminOfOrganizationProcedure, protectedProcedure } from "~/server/api/trpc";

export const invitationRouter = createTRPCRouter({

  add: isAdminOfOrganizationProcedure
    .input(
      z.object({
        receiverIds: z.array(z.string()),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { receiverIds, ...data } = input;

      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user.id },
        include: {
          organizations: {
            where: {
              organizationId: input.organizationId,
              role: "ADMIN",
            }
          }
        }
      });

      if (!currentUser || currentUser.organizations.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action.",
        });
      }

      return ctx.prisma.invitation.createMany({
        data: receiverIds.map(receiverId => ({
          receiverId,
          senderId: ctx.session?.user.id as string,
          ...data,
        })),
      });
    }
  ),

  changeStatus: protectedProcedure
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
              create: [{
                role: "USER",
                user: {
                  connect: {
                    id: ctx.session?.user.id
                  }
                }
              }]
            }
          }
        });
      }

      return await ctx.prisma.invitation.delete({
        where: { id: invitationId }
      });
    }
  ),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.invitation.findMany();
  }),

  getByOrganizationId: hasAccessToOrganizationProcedure
    .input(
      z.object({
        organizationId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.invitation.findMany({
        where: {
          organizationId: input.organizationId
        },
        include: {
          sender: true,
          receiver: true,
          organization: true
        }
      });
  }),

  getByCurrentUser: protectedProcedure
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

	getByCurrentUserCount: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma.invitation.count({
        where: {
          receiverId: ctx.session?.user.id
        },
      });
    }),

  delete: isAdminOfOrganizationProcedure
    .input(
      z.object({
        id: z.string(),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user.id },
        include: {
          organizations: {
            where: {
              organizationId: input.organizationId,
              role: "ADMIN",
            }
          }
        }
      });

      if (!currentUser || currentUser.organizations.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action.",
        });
      }

      return ctx.prisma.invitation.delete({
        where: { id: input.id }
      });
    }
  ),

});

export default invitationRouter;
