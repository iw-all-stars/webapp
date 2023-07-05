import mongoose from "mongoose";

const dbConnect = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined");
  }
  const uri = process.env.MONGODB_URL;

  await mongoose.connect(uri, {
    ignoreUndefined: true,
  });
};

export default dbConnect;

export interface RestaurantType {
  _id: string;
  name: string;
  address: string;
  organizationId: string;
  categoryId: string;
  categoryName?: string;
  location: [number, number];
  isProspect?: boolean;
  comment?: string;
  createdBy?: string;
}

const RestaurantSchema = new mongoose.Schema({
  _id: String,
  name: String,
  address: String,
  organizationId: String,
  categoryId: String,
  categoryName: String,
  isProspect: Boolean,
  comment: String,
  location: {
    type: [Number],
    index: "2dsphere",
    required: true,
  },
  createdBy: String,
});

export const RestaurantModel = (mongoose.models.Restaurant ||
  mongoose.model<RestaurantType>(
    "Restaurant",
    RestaurantSchema
  )) as mongoose.Model<RestaurantType>;
