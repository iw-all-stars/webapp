import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { type NextApiHandler } from "next";
import NodeGeocoder from "node-geocoder";
import { z } from "zod";
import { prisma } from "~/server/db";
import dbConnect, { RestaurantModel } from "~/server/mongoose";
import key from "../../../key.json";

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

dbConnect();

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
  apiKey: "AIzaSyA5knwv6v-Ah2Pz5lGEMLoR0ehAydiO4QM",
});

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "GET") {
    const { categoryId, name, latitude, longitude, radius } = getSchema.parse(
      req.query
    );

    if (latitude && longitude && radius) {
      const restaurants = await RestaurantModel.find({
        categoryId,
        name: {
          $regex: name || "",
          $options: "i",
        },
        location: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], radius / 6378.1],
          },
        },
      }).exec();

      return res.json(restaurants);
    } else {
      const restaurants = await RestaurantModel.find({
        categoryId,
        name: {
          $regex: name || "",
          $options: "i",
        },
      }).exec();

      return res.json(restaurants);
    }
  }

  if (req.method === "POST") {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const { name, latitude, longitude, comment } = postSchema.parse(req.body);

    console.log(name, latitude, longitude, comment);

    const address = await geocoder.reverse({ lat: latitude, lon: longitude });

    const prospect = await prisma.prospect.create({
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
