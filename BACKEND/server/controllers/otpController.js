import crypto from "crypto";
import Otp from "../models/Otp.js";
import Order from "../models/Order.js";
import { sendOtpEmail } from "../utils/mailer.js";
import Admin from "../models/Admin.js";
import Kitchen from "../models/Kitchen.js";
import bcrypt from "bcryptjs";

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;

export const requestOtp = async (req, res) => {
  try {
    const { email, orderId } = req.body;

if (!email || !orderId) {
  return res.status(400).json({
    success: false,
    message: "Email and orderId required"
  });
  
}

const existingOtp = await Otp.findOne({ email, orderId });


    if (existingOtp?.lastSentAt) {
      const secondsPassed =
        (Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000;

      if (secondsPassed < RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(
            RESEND_COOLDOWN_SECONDS - secondsPassed
          )} seconds before requesting a new OTP`
        });
      }
    }


    const otpCode = crypto.randomInt(100000, 999999).toString();

    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    await Otp.findOneAndUpdate(
  { email, orderId },
  {
    email,
    orderId,
    otp: otpCode,
    expiresAt,
    lastSentAt: new Date(),
    attempts: 0
  },
  { upsert: true, new: true }
);

    sendOtpEmail({
  to: email,
  otp: otpCode,
})

    res.json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to send OTP" });
  }
};

export const requestPasswordResetOtp = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role required"
      });
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email, purpose: "password_reset" },
      {
        email,
        otp: otpCode,
        expiresAt,
        purpose: "password_reset",
        attempts: 0,
        lastSentAt: new Date()
      },
      { upsert: true, new: true }
    );

    
    await sendOtpEmail({
      to: email,
      otp: otpCode
    });

    res.json({
      success: true,
      message: "OTP sent for password reset"
    });

  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    });
  }
};


export const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, otp, newPassword, role } = req.body;

    const record = await Otp.findOne({
      email,
      purpose: "password_reset"
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found"
      });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ email, purpose: "password_reset" });
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    if (record.otp !== otp) {
      record.attempts += 1;
      await record.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }



    const Model = role === "admin" ? Admin : Kitchen;

    const user = await Model.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();


    await Otp.deleteOne({ email, purpose: "password_reset" });

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed"
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required"
      });
    }

    const record = await Otp.findOne({ email, orderId });
    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found"
      });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ email, orderId });
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    if (record.otp !== otp) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }


    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.otpVerification = {
      verified: true,
      verifiedAt: new Date()
    };

    if (order.orderStatus === "OTP_PENDING") {
      order.orderStatus = "OTP_VERIFIED";
    }

    await order.save();


    await Otp.deleteOne({ email, orderId });

    res.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed"
    });
  }
};

