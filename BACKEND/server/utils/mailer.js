import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP email using Resend
 */
export const sendOtpEmail = async ({ to, otp, expiresInMinutes = 5 }) => {
  if (!to) {
    throw new Error("Recipient email missing");
  }

  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // temporary sender
      to,
      subject: "OTP Verification",
      html: `
        <h2>Your OTP Code</h2>
        <p><strong>${otp}</strong></p>
        <p>This OTP is valid for ${expiresInMinutes} minutes.</p>
      `
    });

    console.log("✅ Email sent:", response.id);

  } catch (error) {
    console.error("❌ Resend Email Error:", error);
    throw error;
  }
};
