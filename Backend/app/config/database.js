import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to Mongo DB");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
