import Order from "../models/Order.js";

export const razorpayWebhook = async (req, res) => {
  try {
    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured") {
      const payment = payload.payment.entity;

      const orderId = payment.notes?.orderId; // store this when creating Razorpay order
      if (!orderId) return res.json({ ok: true });

      const order = await Order.findById(orderId);
      if (!order) return res.json({ ok: true });

      // ✅ update payment
      order.payment.status = "PAID";
      order.payment.transactionId = payment.id;
      order.payment.paidAt = new Date();

      // ✅ ONLINE → auto confirm + kitchen
      order.adminApproval.approved = true;
      order.orderStatus = "CONFIRMED";
      order.kitchenStatus = "WAITING";

      await order.save();

      // socket emit (if you use io globally)
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
};


