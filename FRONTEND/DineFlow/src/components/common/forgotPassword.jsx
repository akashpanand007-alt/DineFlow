import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, KeyRound, Lock } from "lucide-react";
import API from "../../api/api";

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const ForgotPassword = ({ role }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    try {
      setLoading(true);

      await API.post("/otp/password-reset/request", {
        email: form.email,
        role,
      });

      toast.success("OTP sent to email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);

      await API.post("/otp/password-reset/verify", {
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
        role:"admin"
      });

      toast.success("Password reset successful");

      setTimeout(() => {
        navigate("/admin/login");
      }, 100);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm">
        <h2
          className="text-xl font-bold mb-2 text-center"
          style={{ color: COLORS.text }}
        >
          Forgot Password
        </h2>

        <p
          className="text-sm text-center mb-5"
          style={{ color: COLORS.muted }}
        >
          {step === 1
            ? "Enter your registered email"
            : "Enter OTP and new password"}
        </p>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="flex items-center border rounded-xl px-3 bg-[#F9F5F0] mb-4">
              <Mail size={18} className="text-[#7C6B51]" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-transparent p-3 outline-none"
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: COLORS.primary }}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="flex items-center border rounded-xl px-3 bg-[#F9F5F0] mb-3">
              <KeyRound size={18} className="text-[#7C6B51]" />
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={handleChange}
                className="w-full bg-transparent p-3 outline-none"
              />
            </div>

            <div className="flex items-center border rounded-xl px-3 bg-[#F9F5F0] mb-4">
              <Lock size={18} className="text-[#7C6B51]" />
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full bg-transparent p-3 outline-none"
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: COLORS.primary }}
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;