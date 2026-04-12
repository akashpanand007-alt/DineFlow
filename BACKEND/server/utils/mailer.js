import nodemailer from "nodemailer";

export const sendOtpEmail = async ({ to, otp, expiresInMinutes = 5 }) => {
  if (!to) {
    throw new Error("Recipient email missing");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,       // your gmail
        pass: process.env.EMAIL_PASS        // app password (NOT normal password)
      }
    });

    const info = await transporter.sendMail({
      from: `"DineFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject: "OTP Verification",
      html: `
        <h2>Your OTP Code</h2>
        <p><strong>${otp}</strong></p>
        <p>This OTP is valid for ${expiresInMinutes} minutes.</p>
      `
    });

    console.log("EMAIL SENT:", info.messageId);

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw error;
  }
};