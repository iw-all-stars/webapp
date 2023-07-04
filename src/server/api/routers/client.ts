import { Client } from "@elastic/elasticsearch";
import { z } from "zod";
import { type Client as ClientModel } from "@prisma/client";

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

  getCountClients: protectedProcedure
    .input(z.string().optional())
    .query(async ({ input }) => {

      const elkClient = new Client({
        node: process.env.ELASTICSEARCH_URL ?? "http://localhost:9200",
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME ?? "",
          password: process.env.ELASTICSEARCH_PASSWORD ?? "",
        },
      });
      
      const countResult = await elkClient.count({
        index: "clients",
        body: input ? {
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

      await elkClient.close();

      return countResult.count;
  }),

  getClients: protectedProcedure
    .input(
      z.object({
        input: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {

      const { input: searchInput, limit, offset } = input;

      const elkClient = new Client({
        node: process.env.ELASTICSEARCH_URL ?? "http://localhost:9200",
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME ?? "",
          password: process.env.ELASTICSEARCH_PASSWORD ?? "",
        },
      });

      const searchResult = await elkClient.search<ClientModel>({
        index: "clients",
        from: offset,
        size: limit,
        sort: [{
          "createdAt": {
            order: "desc"
          }
        }],
        body: searchInput ? {
          query: {
            multi_match: {
              query: searchInput,
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

      await elkClient.close();
      
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
