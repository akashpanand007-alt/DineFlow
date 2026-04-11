import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true
    },

    
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },

    
    otpVerification: {
      otp: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 }
    },

    
    payment: {
      method: {
        type: String,
        enum: ["PAY_LATER", "PAY_ONLINE", "null"],
        default: "PAY_LATER"
      },
      status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
        default: "PENDING",
        index: true
      },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null }
    },

    
    adminApproval: {
      approved: { type: Boolean, default: false },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        default: null
      },
      approvedAt: { type: Date, default: null },
      rejected: { type: Boolean, default: false },
      rejectionReason: { type: String, default: null }
    },

    
    kitchenStatus: {
      type: String,
      enum: ["WAITING", "PREPARING", "READY", "SERVED", "CANCELLED"],
      default: "WAITING",
      index: true
    },

    
    orderStatus: {
      type: String,
      enum: [
        "CREATED",
        "OTP_PENDING",
        "OTP_VERIFIED",
        "CONFIRMED",
        "SERVED",
        "REJECTED",
        "COMPLETED",
        "CANCELLED"
      ],
      default: "CREATED"
    },

    
    servedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: 1, orderStatus: 1 });

export default mongoose.models.order ||
  mongoose.model("order", orderSchema);
