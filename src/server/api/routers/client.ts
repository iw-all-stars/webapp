import { z } from "zod";
import { type Mail, type Client as ClientModel, type Restaurant } from "@prisma/client";

import {
  createTRPCRouter,
  hasAccessToRestaurantProcedure,
  hasAccessToOrganizationProcedure,
} from "~/server/api/trpc";
import { type Client } from "@elastic/elasticsearch";

const clientSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string(),
  firstname: z.string().optional(),
});

export const clientRouter = createTRPCRouter({
  getCountClients: hasAccessToRestaurantProcedure
    .input(
      z.object({
        search: z.string().optional(),
        campaignId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, campaignId } = input;
      let sentMails: Mail[] = [];

      if (campaignId) {
        sentMails = await ctx.prisma.mail.findMany({
          where: {
            campaignId: campaignId,
          },
        });

        const campaign = await ctx.prisma.campaign.findUnique({
          where: {
            id: campaignId,
          },
        });

        // if campaign is sent and no mail is sent, return empty array
        if (campaign?.status === "sent" && sentMails.length === 0) {
          return 0;
        }
      }

      const clientIds = sentMails.map((mail) => mail.clientId);

      const countResult = await ctx.elkClient.count({
        index: "clients",
        query: search
          ? {
              bool: {
                minimum_should_match: clientIds.length > 0 ? 3 : 2,
                should: [
                  {
                    match: {
                      restaurantId: ctx.restaurant.id,
                    },
                  },
                  ...(clientIds.length > 0
                    ? [
                        {
                          terms: {
                            _id: clientIds,
                          },
                        },
                      ]
                    : []),
                  {
                    multi_match: {
                      query: search,
                      fields: ["name", "firstname", "email"],
                      operator: "or",
                      type: "bool_prefix",
                    },
                  },
                ],
              },
            }
          : {
              bool: {
                minimum_should_match: clientIds.length > 0 ? 2 : 1,
                should: [
                  {
                    match: {
                      restaurantId: ctx.restaurant.id,
                    },
                  },
                  ...(clientIds.length > 0
                    ? [
                        {
                          terms: {
                            _id: clientIds,
                          },
                        },
                      ]
                    : []),
                ],
              },
            },
      });

      return countResult.count;
    }),

  getCountClientsByRestaurant: hasAccessToOrganizationProcedure.query(async ({ ctx }) => {

    const restaurantsOfOrganization = await ctx.prisma.restaurant.findMany({
      where: {
        organizationId: ctx.userToOrga.organizationId,
      },
    });

    const clientsByRestaurant = await ctx.elkClient.search<Client>({
      index: "clients",
      size: 0,
      query: {
        bool: {
          minimum_should_match: 1,
          should: restaurantsOfOrganization.map((restaurant) => ({
            match: {
              restaurantId: restaurant.id,
            },
          })),
        },
      },
      aggs: {
        restaurants: {
          terms: {
            field: "restaurantId.keyword",
            size: 10000,
          },
        },
      }
    });

    if (clientsByRestaurant?.aggregations?.restaurants) {
      const aggs = clientsByRestaurant.aggregations.restaurants as { buckets: { key: string; doc_count: number }[] };
      const restaurantsWithClientsCount = aggs.buckets.map((bucket) => {
        const { name, createdAt } = restaurantsOfOrganization.find((restaurant) => restaurant.id === bucket.key) as Restaurant;
        return {
          restaurantName: name,
          createdAt: createdAt,
          count: bucket.doc_count,
        }
      });

      restaurantsOfOrganization.forEach(restaurant => {
        if (!restaurantsWithClientsCount.find(restaurantWithCount => restaurantWithCount.restaurantName === restaurant.name)) {
          restaurantsWithClientsCount.push({
            restaurantName: restaurant.name,
            createdAt: restaurant.createdAt,
            count: 0,
          });
        }
      });

      return restaurantsWithClientsCount;
    }
  }),

  getClients: hasAccessToRestaurantProcedure
    .input(
      z.object({
        input: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
        campaignId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { input: searchInput, limit, offset, campaignId } = input;

      let sentMails: Mail[] = [];

      if (campaignId) {
        sentMails = await ctx.prisma.mail.findMany({
          where: {
            campaignId,
          },
        });
        const campaign = await ctx.prisma.campaign.findUnique({
          where: {
            id: campaignId,
          },
        });

        // if campaign is sent and no mail is sent, return empty array
        if (campaign?.status === "sent" && sentMails.length === 0) {
          return [];
        }
      }

      const clientIds = sentMails.map((mail) => mail.clientId);

      const searchResults = await ctx.elkClient.search<ClientModel>({
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
                minimum_should_match: clientIds.length > 0 ? 3 : 2,
                should: [
                  {
                    match: {
                      restaurantId: ctx.restaurant.id,
                    },
                  },
                  ...(clientIds.length > 0
                    ? [
                        {
                          terms: {
                            _id: clientIds,
                          },
                        },
                      ]
                    : []),
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
              bool: {
                minimum_should_match: clientIds.length > 0 ? 2 : 1,
                should: [
                  {
                    match: {
                      restaurantId: ctx.restaurant.id,
                    },
                  },
                  ...(clientIds.length > 0
                    ? [
                        {
                          terms: {
                            _id: clientIds,
                          },
                        },
                      ]
                    : []),
                ],
              },
            },
      });

      const clients = searchResults.hits.hits.map((client) => ({
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
        .findUnique({ where: { email_restaurantId: { email, restaurantId: ctx.restaurant.id }} })
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
        .findUnique({ where: { email_restaurantId: { email, restaurantId: ctx.restaurant.id }} })
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
