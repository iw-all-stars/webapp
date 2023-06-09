import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, hasAccessToOrganizationProcedure, isAdminOfOrganizationProcedure, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const organizationRouter = createTRPCRouter({
  add: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.organization.create({ 
        data: {
          name: input.name,
          users: {
            create: [{
              role: "ADMIN",
              user: {
                connect: {
                  id: input.userId,
                }
              }
            }]
          },
        }
      });
    }),

  update: isAdminOfOrganizationProcedure
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

  getById: hasAccessToOrganizationProcedure
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

  getByCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.organization.findMany({
      where: {
        users: {
          some: {
            user: {
              id: ctx.session?.user.id,
            }
          }
        }
      },
      include: {
        restaurants: {
          select: {
            id: true,
            name: true,
          }
        },
        users: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "asc",
      }
    });
  }),

  removeUser: isAdminOfOrganizationProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string(),  
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, userId } = input;

      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user.id },
        include: {
          organizations: {
            where: {
              organizationId: id,
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

      return ctx.prisma.organization.update({
        where: { id },
        data: {
          users: {
            delete: [{
              userId_organizationId: {
                userId,
                organizationId: id,
              }
            }]
          }
        }
      })
    }),
});

export default organizationRouter;
