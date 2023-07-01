import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  template: z.number(),
  subject: z.string(),
  body: z.string(),
  url: z.string(),
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
  url: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().optional(),
});

export const campaignRouter = createTRPCRouter({
  getCampaigns: protectedProcedure
  .input(z.string().optional())
  .query(({ ctx, input = "" }) => {
    return ctx.prisma.campaign.findMany({
      include: { mail: true },
      where: {
        OR: [
          { name: { contains: input, mode: "insensitive" } },
          { subject: { contains: input, mode: "insensitive" } },
        ],
      },
    });
  }),
  findCampaignByName: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
    }))
    .query(({ ctx, input }) => {
      if (!input.name) return null;
      return ctx.prisma.campaign.findFirst({
        where: {
          name: input.name,
        },
        include: { mail: true },
      });
    }),
  getCampaign: protectedProcedure
    .input(z.string().nonempty())
    .query(({ ctx, input }) => {
      return ctx.prisma.campaign.findUnique({
        where: { id: input },
        include: { mail: true },
      });
    }),
  createCampaign: protectedProcedure
    .input(campaignSchema.omit({ id: true, creatorId: true, status: true }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.campaign.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
          restaurantId: input.restaurantId,
          template: input.template,
          subject: input.subject,
          body: input.body,
          url: input.url,
          status: "draft",
        },
      });
    }),
  initializeCampaign: protectedProcedure
    .input(campaignSchema.omit({ id: true, creatorId: true, status: true, subject: true, body: true, url: true }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.campaign.create({
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
    }),
  updateCampaign: protectedProcedure
    .input(updateCampaignSchema)
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.campaign.update({ where: { id }, data });
    }),
  deleteCampaign: protectedProcedure
    .input(z.string().nonempty())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.campaign.delete({ where: { id: input } });
    }),
});

export default campaignRouter;
