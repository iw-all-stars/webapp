import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  template: z.number(),
  subject: z.string(),
  body: z.string(),
  url: z.string(),
  creatorId: z.string(),
  restaurantId: z.string(),
  status: z.string(),
});

export const campaignRouter = createTRPCRouter({
  getCampaigns: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.campaign.findMany();
  }),
  getCampaign: publicProcedure
    .input(z.string().nonempty())
    .query(({ ctx, input }) => {
      return ctx.prisma.campaign.findUnique({ where: { id: input } });
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
          type: input.type,
          subject: input.subject,
          body: input.body,
          url: input.url,
          status: "draft",
        },
      });
    }),
  updateCampaign: protectedProcedure
    .input(campaignSchema.pick({ id: true, name: true, type: true, status: true }))
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
