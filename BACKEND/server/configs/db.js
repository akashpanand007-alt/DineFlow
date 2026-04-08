import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI;

    if (!MONGO_URI) {
      throw new Error("MONGODB_URI not defined in .env");
    }

    // Connect and wait until fully ready
    await mongoose.connect(MONGO_URI, {
      dbName: "StackMartDB",   // your DB name
    });

  } catch (error) {
    process.exit(1); // stop server if DB fails
  }
};

export default connectDB;
