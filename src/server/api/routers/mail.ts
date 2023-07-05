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
  includeClients: z.array(z.string()).optional(),
  excludeClients: z.array(z.string()).optional(),
  selectAllRecipients: z.boolean().optional(),
});

export const mailRouter = createTRPCRouter({
  getMails: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      return ctx.prisma.mail.findMany({
        where: {
          campaignId: input,
          status: "sent",
        },
        include: {
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
        include: {
          campaign: {
            include: { restaurant: true },
          },
          client: true,
        },
      });

      if (!mail) {
        throw new Error("Mail not found");
      }

      sendEmail({
        email: mail.client.email,
        firstname: mail.client.firstname || mail.client.name,
        subject: mail.campaign.subject,
        body: mail.campaign.body,
        mailId: mail.id,
        restaurant: mail.campaign.restaurant.name,
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
        const {
          campaignId,
          includeClients,
          excludeClients,
          selectAllRecipients,
        } = input;
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

        if (!selectAllRecipients && !includeClients && !excludeClients) {
          throw new Error("Aucun destinataire sélectionné");
        }

        if (campaign.status === "sent") {
          throw new Error("La campagne a déjà été envoyée");
        }

        // if selectAllRecipients is true, get all clients except excludeClients
        // if selectAllRecipients is false, get only includeClients

        const clients = await ctx.prisma.client.findMany({
          where: {
            restaurantId: campaign.restaurantId,
            ...(selectAllRecipients
              ? {
                  id: {
                    notIn: excludeClients,
                  },
                }
              : {
                  id: {
                    in: includeClients,
                  },
                }),
          },
        });

        // Create mails for each client in clients array and link them to the campaign id and client id, don't use createMany because it doesn't return the created mails

        const mails = await Promise.all(
          clients.map((client) =>
            ctx.prisma.mail.create({
              data: {
                campaignId,
                clientId: client.id,
                status: "draft",
              },
              include: {
                client: true,
              },
            })
          )
        );

        clients.forEach((client) => {
          const mail = mails.find(
            (m: { clientId: string }) => m.clientId === client.id
          );
          if (!mail) {
            throw new Error("Erreur lors de l'envoi de la campagne");
          }
          const body = campaign.body
            .replaceAll(
              "@Prénom_client",
              mail.client.firstname || mail.client.name
            )
            .replaceAll("@Nom_Etablissement", campaign.restaurant.name);
          sendEmail({
            restaurant: campaign.restaurant.name,
            email: mail.client.email,
            firstname: mail.client.firstname || mail.client.name,
            subject: campaign.subject,
            body,
            mailId: mail.id,
            logoURL: campaign.restaurant.logo
              ? campaign.restaurant.logo
              : undefined,
          });
        });

        await ctx.prisma.mail.updateMany({
          where: { id: { in: mails.map((m: { id: string }) => m.id) } },
          data: {
            status: "sent",
          },
        });

        // Update campaign status
        await ctx.prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: "sent",
          },
        });

        const updatedCampaign = await ctx.prisma.campaign.findUnique({
          where: { id: campaignId },
          include: {
            restaurant: true,
            mail: {
              include: { client: true },
            },
          },
        });

        return updatedCampaign;
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
