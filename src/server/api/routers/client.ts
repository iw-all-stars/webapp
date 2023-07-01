import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const clientSchema = z.object({
  id: z.string().optional(),
  email: z.string(),
  name: z.string(),
  firstname: z.string().nullable(),
  phone: z.string().nullable(),
  image: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  zip: z.string().nullable(),
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
      return ctx.prisma.client.create({
        data: {
          ...input,
          image: "https://i.pravatar.cc/150",
        },
      });
    }),
  updateClient: protectedProcedure
    .input(clientSchema)
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.client.update({ where: { id }, data });
    }),
  deleteClient: protectedProcedure
    .input(z.string().nonempty())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.client.delete({ where: { id: input } });
    }),
});

export default clientRouter;
