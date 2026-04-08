import express from "express";
import { requestOtp, verifyOtp,verifyPasswordResetOtp,requestPasswordResetOtp } from "../controllers/otpController.js";
const router = express.Router();

router.post("/request", requestOtp);
router.post("/verify", verifyOtp);
router.post("/password-reset/request", requestPasswordResetOtp);
router.post("/password-reset/verify", verifyPasswordResetOtp);

export default router;
