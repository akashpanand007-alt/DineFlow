import nodemailer from "nodemailer";

export const sendOtpEmail = async ({ to, otp, expiresInMinutes = 5 }) => {
  if (!to) {
    throw new Error("Recipient email missing");
  }

  try {
    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
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