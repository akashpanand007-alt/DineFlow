import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  orderId: { type: String, required: false },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  lastSentAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  purpose: {
  type: String,
  enum: ["order", "password_reset"],
  default: "order"
}
});

otpSchema.index(
  { email: 1, orderId: 1 },
  { unique: true, partialFilterExpression: { orderId: { $exists: true } } }
);
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);
