import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send OTP email (BACKEND ONLY)
 */
export const sendOtpEmail = async ({ to, otp, expiresInMinutes = 5 }) => {
  if (!to) {
    throw new Error("Recipient email missing");
  }

  const mailOptions = {
    from: `"Restaurant Orders" <${process.env.EMAIL_USER}>`,
    to, // ✅ CORRECT VARIABLE
    subject: "OTP Verification",
    html: `
      <p>Your OTP is <strong>${otp}</strong></p>
      <p>This OTP is valid for ${expiresInMinutes} minutes.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
