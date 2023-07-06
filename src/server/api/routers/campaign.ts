import { z } from "zod";
import { createTRPCRouter, hasAccessToRestaurantProcedure, hasAccessToOrganizationProcedure } from "~/server/api/trpc";

const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  template: z.number(),
  subject: z.string(),
  body: z.string(),
  url: z.string().url(),
  creatorId: z.string(),
  restaurantId: z.string(),
  status: z.string(),
});

const updateCampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  subject: z.string().optional(),
  body: z.string().optional(),
  url: z.string().url().optional(),
  fromName: z.string().optional(),
});

export const campaignRouter = createTRPCRouter({
  getCountCampaigns: hasAccessToRestaurantProcedure
    .input(z.string().optional())
    .query(({ ctx, input = "" }) => {
      return ctx.prisma.campaign.count({
        where: {
          OR: [
            { name: { contains: input, mode: "insensitive" } },
            { subject: { contains: input, mode: "insensitive" } },
          ],
          restaurantId: ctx.restaurant.id,
        },
      });
    }),

  getCountCampaignsByRestaurant: hasAccessToOrganizationProcedure
    .query(async ({ ctx }) => {

      const restaurantsOfOrganization = await ctx.prisma.restaurant.findMany({
        where: {
          organizationId: ctx.userToOrga.organizationId,
        },
      });

      const campaignOfOrganization = await ctx.prisma.campaign.findMany({
        where: {
          restaurantId: {
            in: restaurantsOfOrganization.map((restaurant) => restaurant.id),
          },
        },
      })

      return restaurantsOfOrganization.map(restaurant => ({
        restaurantName: restaurant.name,
        count: campaignOfOrganization.filter(campaign => campaign.restaurantId === restaurant.id).length
      }))
    }),

  getCampaigns: hasAccessToRestaurantProcedure
    .input(
      z.object({
        input: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
    .query(({ ctx, input }) => {

      const { input: searchInput = "", limit, offset } = input;

      return ctx.prisma.campaign.findMany({
        skip: offset,
        take: limit,
        include: { mail: true, user: true },
        where: {
          OR: [
            { name: { contains: searchInput, mode: "insensitive" } },
            { subject: { contains: searchInput, mode: "insensitive" } },
          ],
          restaurantId: ctx.restaurant.id,
        },
      });
    }),
  getCampaign: hasAccessToRestaurantProcedure
    .input(z.string().nonempty())
    .query(({ ctx, input }) => {
      return ctx.prisma.campaign.findUnique({
        where: { id: input },
        include: {
          mail: true,
          user: true,
        },
      });
    }),
  initializeCampaign: hasAccessToRestaurantProcedure
    .input(
      campaignSchema.omit({
        id: true,
        creatorId: true,
        status: true,
        subject: true,
        body: true,
        url: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user.id) throw new Error("No user in session");
      const createdCampaign = await ctx.prisma.campaign.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
          restaurantId: input.restaurantId,
          template: input.template,
          subject: "",
          body: "",
          url: "",
          status: "draft",
        },
      });

      return ctx.prisma.campaign.findUnique({
        where: { id: createdCampaign.id },
        include: {
          mail: true,
          user: true,
        },
      });
    }),
  updateCampaign: hasAccessToRestaurantProcedure
    .input(updateCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updatedCampaign = await ctx.prisma.campaign.update({ where: { id }, data });
      return ctx.prisma.campaign.findUnique({
        where: { id: updatedCampaign.id },
        include: {
          mail: true,
          user: true,
        },
      });
    }),
  deleteCampaign: hasAccessToRestaurantProcedure
    .input(z.object({
		id: z.string().nonempty()
	}))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.campaign.delete({ where: { id: input.id } });
    }),
});

export default campaignRouter;
