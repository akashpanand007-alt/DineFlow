
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createPaymentLink = async (req, res) => {
  try {
    const { orderId, amount, email } = req.body;

    const link = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      description: `Payment for order ${orderId}`,
      customer: { email },
      notify: { email: true },
      reminder_enable: false
    });

    res.json({
      success: true,
      paymentLink: link.short_url
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
