import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, KeyRound, Lock } from "lucide-react";
import API from "../../api/api";
import { COLORS } from "../../constants/theme";

const ForgotPassword = ({ role = "admin" }) => {
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
    if (!form.email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      await API.post("/otp/password-reset/request", {
        email: form.email,
        role,
      });

      toast.success("OTP sent to email");
      setStep(2);
    } catch (err) {
      console.error("Failed to send OTP:", err);
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!form.otp || !form.newPassword) {
      toast.error("Please enter OTP and new password");
      return;
    }

    try {
      setLoading(true);

      await API.post("/otp/password-reset/verify", {
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
        role,
      });

      toast.success("Password reset successful");

      setTimeout(() => {
        if (role === "kitchen") {
          navigate("/kitchen/login");
        } else {
          navigate("/admin/login");
        }
      }, 1000);
    } catch (err) {
      console.error("Failed to reset password:", err);
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
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                className="w-full bg-transparent p-3 outline-none text-[#312B1E]"
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white cursor-pointer hover:opacity-90 disabled:opacity-60 transition-opacity"
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
                className="w-full bg-transparent p-3 outline-none text-[#312B1E]"
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
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                className="w-full bg-transparent p-3 outline-none text-[#312B1E]"
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white cursor-pointer hover:opacity-90 disabled:opacity-60 transition-opacity"
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