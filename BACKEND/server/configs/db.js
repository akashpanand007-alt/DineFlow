import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI;

    if (!MONGO_URI) {
      throw new Error("MONGODB_URI not defined in .env");
    }

   
    await mongoose.connect(MONGO_URI, {
      dbName: "StackMartDB",   
    });

  } catch (error) {
    process.exit(1); 
  }
};

export default connectDB;
