import { Client } from "@elastic/elasticsearch";
import { z } from "zod";
import { type Client as ClientModel } from "@prisma/client";

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


const elkClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME as string,
    password: process.env.ELASTICSEARCH_PASSWORD as string,
  },
})

export const clientRouter = createTRPCRouter({
  getClients: protectedProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input = "" }) => {

      const searchResult = await elkClient.search<ClientModel>({
        index: "clients",
        body: input !== "" ? {
          query: {
            multi_match: {
              query: input,
              fields: ["name", "firstname", "email"],
              operator: "or",
              type: "bool_prefix"
            },
          },
        } : {
          query: {
            match_all: {}
          }
        }
      })

      const clients = searchResult.hits.hits.map(client => ({
        id: client._id,
        ...client._source as Omit<ClientModel, "id">,
      }))

      return clients;
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
