import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

const clientSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  firstname: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});

export const clientRouter = createTRPCRouter({
  getClients: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.client.findMany();
  }),
  getClient: protectedProcedure
    .input(z.string().nonempty())
    .query(({ ctx, input }) => {
      return ctx.prisma.client.findUnique({ where: { id: input } });
    }),
  createClient: protectedProcedure
    .input(clientSchema.omit({ id: true }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.client.create({
        data: {
          ...input,
          email: input.email,
          name: input.name,
          firstname: input.firstname,
          phone: input.phone,
          image: input.image,
          address: input.address,
          city: input.city,
          state: input.state,
          zip: input.zip,
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
