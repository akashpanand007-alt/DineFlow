import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  markPaymentFailed   // ✅ add
} from "../controllers/paymentController.js";
import { createPaymentLink } from "../controllers/paymentLinkController.js";

const router = express.Router();

router.post("/create-order", createRazorpayOrder);
router.post("/verify-payment", verifyRazorpayPayment);
router.post("/payment-failed", markPaymentFailed);   // ✅ added
router.post("/create-payment-link", createPaymentLink);

export default router;
