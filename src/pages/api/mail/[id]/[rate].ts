import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!req.query.id || !req.query.rate) {
    return res.status(400).json({ message: "Missing id or rate" });
  }

  try {
    const mail = await prisma.mail.findFirst({
      where: { id: req.query.id as string },
      include: { campaign: true },
    });

    if (!mail) {
      return res.status(400).json({ message: "Mail not found" });
    }

    if (!Number(mail.rate)) {
      await prisma.mail.update({
        where: { id: req.query.id as string },
        data: {
          rate: Number(req.query.rate),
          opened: true,
        },
      });
    }

    return res.redirect(301, mail.campaign.url);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
};
