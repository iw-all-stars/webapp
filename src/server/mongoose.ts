import mongoose from "mongoose";

const dbConnect = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined");
  }
  const uri = process.env.MONGODB_URL;
  await mongoose.connect(uri, {});
}

dbConnect().catch((err) => console.log(err));

export default dbConnect;