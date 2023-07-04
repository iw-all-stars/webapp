import { type NextApiHandler } from "next";
import NodeGeocoder from "node-geocoder";
import { z } from "zod";
import { prisma } from "~/server/db";
import dbConnect, { RestaurantModel } from "~/server/mongoose";

const getSchema = z.object({
  categoryId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  radius: z.coerce.number().optional().nullable(),
});

const postSchema = z.object({
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

dbConnect();

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
    const { name, latitude, longitude } = postSchema.parse(req.body);

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
      address: address[0]?.formattedAddress,
      location: [longitude, latitude],
      isProspect: true,
    });

    return res.status(201).json(restaurant);
  }
};

export default handler;
