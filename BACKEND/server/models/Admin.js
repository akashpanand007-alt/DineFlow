import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  // Add role or permissions if necessary
  createdAt: { type: Date, default: Date.now },
});

// You may want to hash the password before saving
export default mongoose.model("Admin", adminSchema);
