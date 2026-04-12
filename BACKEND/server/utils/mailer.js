import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async ({ to, otp, expiresInMinutes = 5 }) => {
  if (!to) {
    throw new Error("Recipient email missing");
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }

  try {
    const response = await resend.emails.send({
      from: "DineFlow <no-reply@dine-flow.in>",
      to,
      subject: "Your OTP Code - DineFlow",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>DineFlow OTP Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing: 6px; color: #333;">${otp}</h1>
          <p>This OTP is valid for ${expiresInMinutes} minutes.</p>
          <p style="color: #888;">If you didn’t request this, ignore this email.</p>
        </div>
      `,
    });


    return response;

  } catch (error) {
    throw new Error("Failed to send OTP email");
  }
};