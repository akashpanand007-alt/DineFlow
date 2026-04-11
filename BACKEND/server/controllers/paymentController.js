import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payments/create-order
 * Backend-only: creates Razorpay order AFTER OTP verification
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });


    if (!order.otpVerification?.verified) {
      return res.status(403).json({
        success: false,
        message: "OTP verification required before payment"
      });
    }


    if (order.payment.status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order already paid"
      });
    }

    const amount = order.totalAmount * 100; 

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `order_${order._id}`
    });


    order.payment.transactionId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID 
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order"
    });
  }
};

/**
 * POST /api/payments/verify-payment
 * Backend-only Razorpay signature verification
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });


    if (order.payment.status === "PAID") {
      return res.json({ success: true, order });
    }

    if (order.payment.transactionId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order mismatch"
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay signature"
      });
    }

    
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

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};

export const markPaymentFailed = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.payment.status = "FAILED";
    order.payment.failureReason = reason || "Payment failed";
    order.orderStatus = "PAYMENT_FAILED";

    await order.save();

    res.json({ success: true, message: "Payment marked as failed" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
