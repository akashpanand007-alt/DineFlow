import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    required: true
  },

  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true, lowercase:true },

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required:true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],

  totalAmount: { type: Number, required: true },

  paymentType: {
    type: String,
    enum: ["Pay Online", "Pay Later"],
    required: true
  },

  status: { type: String, default: "Pending" }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;

