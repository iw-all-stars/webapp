import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const clientSchema = z.object({
  id: z.string().optional(),
  email: z.string(),
  name: z.string(),
  firstname: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
});

export const clientRouter = createTRPCRouter({
  getClients: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input = "" }) => {
      return ctx.prisma.client.findMany({
        where: {
          unsubscribed: false,
          OR: [
            { name: { contains: input, mode: "insensitive" } },
            { firstname: { contains: input, mode: "insensitive" } },
            { email: { contains: input, mode: "insensitive" } },
            { address: { contains: input, mode: "insensitive" } },
            { city: { contains: input, mode: "insensitive" } },
            { zip: { contains: input, mode: "insensitive" } },
          ],
        },
      });
    }),
  getClient: protectedProcedure
    .input(z.string().nonempty())
    .query(({ ctx, input }) => {
      return ctx.prisma.client.findUnique({ where: { id: input } });
    }),
  createClient: protectedProcedure
    .input(clientSchema.omit({ id: true, image: true }))
    .mutation(({ ctx, input }) => {
      const { email } = input;
      return ctx.prisma.client
        .findUnique({ where: { email } })
        .then((client) => {
          if (client) {
            throw new Error("Un client avec cet email existe déjà");
          }
        })
        .then(() => {
          return ctx.prisma.client.create({
            data: {
              ...input,
              image: "",
            },
          });
        });
    }),
  updateClient: protectedProcedure
    .input(clientSchema.omit({ image: true }))
    .mutation(({ ctx, input }) => {
      const { id, email, ...data } = input;
      return ctx.prisma.client
        .findUnique({ where: { email } })
        .then((client) => {
          if (client && client.id !== id) {
            throw new Error("Un client avec cet email existe déjà");
          }
          return ctx.prisma.client.update({
            where: { id },
            data: {
              ...data,
              image: "",
            },
          });
        });
    }),
  deleteClient: protectedProcedure
    .input(z.string().nonempty())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.client.delete({ where: { id: input } });
    }),
});

export default clientRouter;
