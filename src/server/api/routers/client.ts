import { z } from "zod";
import { type Client as ClientModel } from "@prisma/client";

import {
  createTRPCRouter,
  hasAccessToRestaurantProcedure,
} from "~/server/api/trpc";

const clientSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string(),
  firstname: z.string().optional(),
});

export const clientRouter = createTRPCRouter({
  getCountClients: hasAccessToRestaurantProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {

      const countResult = await ctx.elkClient.count({
        index: "clients",
        body: input
          ? {
              query: {
                multi_match: {
                  query: input,
                  fields: ["name", "firstname", "email"],
                  operator: "or",
                  type: "bool_prefix",
                },
              },
            }
          : {
              query: {
                match_all: {},
              },
            },
      });

      return countResult.count;
    }),

  getClients: hasAccessToRestaurantProcedure
    .input(
      z.object({
        input: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { input: searchInput, limit, offset } = input;

      const searchResult = await ctx.elkClient.search<ClientModel>({
        index: "clients",
        from: offset,
        size: limit,
        sort: [
          {
            createdAt: {
              order: "desc",
            },
          },
        ],
        query: searchInput
          ? {
              bool: {
                minimum_should_match: 2,
                should: [
                  {
                    match: {
                      restaurantId: ctx.restaurant.id,
                    },
                  },
                  {
                    multi_match: {
                      query: searchInput,
                      fields: ["name", "firstname", "email"],
                      operator: "or",
                      type: "bool_prefix",
                    },
                  },
                ],
              },
            }
          : {
              match: {
                restaurantId: ctx.restaurant.id,
              },
            },
      });

      const clients = searchResult.hits.hits.map((client) => ({
        id: client._id,
        ...(client._source as Omit<ClientModel, "id">),
      }));

      return clients;
    }),
  getClient: hasAccessToRestaurantProcedure
    .input(z.string().nonempty())
    .query(({ ctx, input }) => {
      return ctx.prisma.client.findUnique({ where: { id: input } });
    }),
  createClient: hasAccessToRestaurantProcedure
    .input(clientSchema.omit({ id: true }))
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
              restaurantId: ctx.restaurant.id,
            },
          });
        });
    }),
  updateClient: hasAccessToRestaurantProcedure
    .input(clientSchema)
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
              email,
              image: "",
            },
          });
        });
    }),
  deleteClient: hasAccessToRestaurantProcedure
    .input(z.string().nonempty())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.client.delete({ where: { id: input } });
    }),
});

export default clientRouter;
