import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import sendEmail from "../mail/service";

const mailSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  rate: z.number().optional(),
  opened: z.boolean().optional().default(false),
  unsub: z.boolean().optional().default(false),
  status: z.string().optional().default("draft"),
  clientId: z.string(),
});

export const mailRouter = createTRPCRouter({
  getMails: protectedProcedure.query(({ ctx, input }) => {
    return ctx.prisma.mail.findMany({
      where: {
        campaignId: input,
      },
      include: {
        campaign: true,
        client: true,
      },
    });
  }),

  createMail: protectedProcedure
    .input(mailSchema.omit({ id: true }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.mail.create({
        data: {
          ...input,
        },
      });
    }),

  sendMail: protectedProcedure
    .input(z.string().nonempty())
    .mutation(async ({ ctx, input }) => {
      const mail = await ctx.prisma.mail.findUnique({
        where: { id: input },
        include: { campaign: true, client: true },
      });

      if (!mail) {
        throw new Error("Mail not found");
      }

      sendEmail({
        templateId: mail.campaign.template,
        email: mail.client.email,
        name: mail.client.name,
        subject: mail.campaign.subject,
        body: mail.campaign.body,
        mailId: mail.id,
      });

      return ctx.prisma.mail.update({
        where: { id: input },
        data: {
          status: "sent",
        },
      });
    }),

  updateMail: protectedProcedure
    .input(
      mailSchema.pick({
        id: true,
        status: true,
        rate: true,
        opened: true,
        unsub: true,
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.mail.update({ where: { id }, data });
    }),

  deleteMail: protectedProcedure
    .input(z.string().nonempty())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.mail.delete({ where: { id: input } });
    }),
});

export default mailRouter;
