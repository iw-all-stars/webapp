import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
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

const sendCampaignSchema = z.object({
  campaignId: z.string(),
  recipientIds: z.array(z.string()),
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
        include: { campaign: {
          include: { restaurant: true },
        }, client: true },
      });

      if (!mail) {
        throw new Error("Mail not found");
      }

      sendEmail({
        templateId: mail.campaign.template,
        email: mail.client.email,
        firstname: mail.client.firstname || mail.client.name,
        subject: mail.campaign.subject,
        body: mail.campaign.body,
        mailId: mail.id,
        restaurant: mail.campaign.restaurant.name,
        rateURL: `https://www.google.com/search?q=${mail.campaign.restaurant.name}`, // todo: replace with real url
        logoURL: mail.campaign.restaurant.logo as string,
      });

      return ctx.prisma.mail.update({
        where: { id: input },
        data: {
          status: "sent",
        },
      });
    }),

  sendCampaign: protectedProcedure
    .input(sendCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async (_) => {
        const { campaignId, recipientIds } = input;
        const campaign = await ctx.prisma.campaign.findUnique({
          where: { id: campaignId },
          include: {
            restaurant: true,
            mail: {
              include: { client: true },
            },
          },
        });

        if (!campaign) {
          throw new Error("Erreur lors de l'envoi de la campagne");
        }

        if (!recipientIds.length) {
          throw new Error("Aucun destinataire sélectionné");
        }

        if (campaign.status !== "draft") {
          throw new Error("La campagne a déjà été envoyée");
        }

        // Create mails for recipients
        const mails = await ctx.prisma.$transaction(
          recipientIds.map((id) =>
            ctx.prisma.mail.create({
              data: {
                campaignId,
                clientId: id,
                status: "draft",
              },
              include: {
                client: true,
              },
            })
          )
        );

        // Update campaign status
        await ctx.prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: "sent",
          },
        });

        // Send emails
        recipientIds.forEach((id) => {
          const mail = mails.find((m: { clientId: string; }) => m.clientId === id);
          if (!mail) {
            throw new Error("Erreur lors de l'envoi de la campagne");
          }
          sendEmail({
            templateId: 5,
            email: mail.client.email,
            firstname: mail.client.firstname || mail.client.name,
            subject: campaign.subject,
            body: campaign.body,
            mailId: mail.id,
            restaurant: campaign.restaurant.name,
            rateURL: `https://www.google.com/search?q=${campaign.restaurant.name}`, // todo: replace with real url
            logoURL: campaign.restaurant.logo ? campaign.restaurant.logo as string : undefined,
          });
        });
        await ctx.prisma.mail.updateMany({
          where: { id: { in: mails.map((m: { id: string; }) => m.id) } },
          data: {
            status: "sent",
          },
        });
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
