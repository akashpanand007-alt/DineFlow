import express from "express";
import Order from "../models/Order.js";

const router = express.Router();


router.post("/razorpay", async (req, res) => {
  try {
    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured") {
      const payment = payload.payment.entity;
      const orderId = payment.notes?.orderId;

      if (!orderId) return res.json({ ok: true });

      const order = await Order.findById(orderId);
      if (!order) return res.json({ ok: true });

      order.payment.method = "PAY_ONLINE";
order.payment.status = "PAID";
order.payment.paidAt = new Date();
order.payment.transactionId = razorpay_payment_id;

order.adminApproval.approved = true;
order.orderStatus = "CONFIRMED";
order.kitchenStatus = "WAITING"; 

await order.save();

const io = req.app.get("io");
if (io) {
  io.to("kitchen").emit("order_approved", order); 
  io.to("admins").emit("order_paid_online", order);
}
    }

    if (event === "payment.failed") {
      const payment = payload.payment.entity;
      const orderId = payment.notes?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          "payment.status": "FAILED",
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: "Webhook error" });
  }
});

export default router;