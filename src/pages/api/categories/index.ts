import { type NextApiHandler } from "next";
import { prisma } from "~/server/db";

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "GET") {
    const categories = await prisma.category.findMany();

    return res.json(categories);
  }
};

export default handler;
