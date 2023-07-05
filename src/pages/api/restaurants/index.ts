import { type PrismaClient } from "@prisma/client";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { type NextApiHandler } from "next";
import NodeGeocoder from "node-geocoder";
import { z } from "zod";
import dbConnect, { RestaurantModel } from "~/server/mongoose";
import { validateAuth0 } from "~/utils/validateAuth0";
import key from "../../../key.json";
import prismaInstance from "../../../server/client.prisma";

const getSchema = z.object({
  categoryId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  radius: z.coerce.number().optional().nullable(),
});

const postSchema = z.object({
  name: z.string(),
  comment: z.string().optional().nullable(),
  latitude: z.number(),
  longitude: z.number(),
});

const deleteSchema = z.object({
  id: z.string(),
});

dbConnect();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient = globalForPrisma.prisma ?? prismaInstance;

const serviceAccountAuth = new JWT({
  // env var values here are copied from service account credentials generated by google
  // see "Authentication" section in docs for more info
  email: "google-sheets@challenge-iw5.iam.gserviceaccount.com",
  key: key.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(
  "1LhZEkgQmTai-GeWcaWZ9ZS7v6UxlJqKHbAlRbTqCUiQ",
  serviceAccountAuth
);

const geocoder = NodeGeocoder({
  provider: "google",
  apiKey: process.env.GOOGLE_API_KEY,
});

const handler: NextApiHandler = async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let user: { sub: string } | undefined;

  try {
    user = (await validateAuth0(req.headers.authorization)) as { sub: string };
  } catch (e) {
    console.log(e);
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    const { categoryId, name, latitude, longitude, radius } = getSchema.parse(
      req.query
    );

    if (latitude && longitude && radius) {
      const restaurants = await RestaurantModel.find({
        categoryId,
        name: name ? { $regex: name, $options: "i" } : undefined,
        location: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], radius / 6378.1],
          },
        },
      }).exec();

      return res.json(restaurants);
    }

    const restaurants = await RestaurantModel.find({
      categoryId,
      name: name ? { $regex: name, $options: "i" } : undefined,
    }).exec();

    return res.json(restaurants);
  }

  if (req.method === "DELETE") {
    const { id } = deleteSchema.parse(req.body);

    const restaurant = await RestaurantModel.findOne({
      _id: id,
    });

    if (!restaurant || user.sub !== restaurant.createdBy) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await prismaClient.prospect.delete({
      where: {
        id,
      },
    });

    await RestaurantModel.deleteOne({ _id: id }).exec();

    return res.status(204).end();
  }

  if (req.method === "POST") {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const { name, latitude, longitude, comment } = postSchema.parse(req.body);

    const address = await geocoder.reverse({ lat: latitude, lon: longitude });

    const prospect = await prismaClient.prospect.create({
      data: {
        name,
        address: address[0]?.formattedAddress,
        latitude,
        longitude,
      },
    });

    const restaurant = await RestaurantModel.create({
      _id: prospect.id,
      name,
      comment,
      address: address[0]?.formattedAddress,
      location: [longitude, latitude],
      isProspect: true,
      createdBy: user.sub,
    });

    await sheet?.addRow(
      {
        name,
        address: address[0]?.formattedAddress || "n/a",
        comment: comment || "n/a",
        created_at: new Date(),
      },
      { insert: true }
    );

    return res.status(201).json(restaurant);
  }
};

export default handler;
