import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!req.query.id) {
    return res.status(400).json({ message: "Missing id or rate" });
  }

  try {
    const mail = await prisma.mail.findFirst({
      where: { id: req.query.id as string },
    });

    if (!mail) {
      return res.status(400).json({ message: "Mail not found" });
    }

    await prisma.mail.update({
      where: { id: req.query.id as string },
      data: {
        unsub: true,
        opened: true,
      },
    });
    return res
      .status(200)
      .setHeader("Content-Type", "text/html")
      .send(
        "<html><body><h3>Vous avez &eacute;t&eacute; d&eacute;sinscrit avec succ&egrave;s de notre liste de diffusion &#128077;</h3></body></html>"
      );
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
};
