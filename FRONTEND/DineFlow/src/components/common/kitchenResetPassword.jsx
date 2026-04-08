import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, KeyRound, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import API from "../../api/api";

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const KitchenResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const handleReset = async () => {
    try {
      await API.post("/otp/password-reset/verify", {
        email,
        otp,
        newPassword: password,
        role: "kitchen",
      });

      setToast({
        show: true,
        type: "success",
        message: "Password reset successful",
      });

      setTimeout(() => {
        navigate("/kitchen/login");
      }, 1200);

    } catch (err) {
      setToast({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Failed",
      });
    }

    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 2500);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* ✅ Toast */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[200]">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white font-semibold ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {toast.message}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm">
        <h2
          className="text-xl font-bold mb-2 text-center"
          style={{ color: COLORS.text }}
        >
          Reset Password
        </h2>

        <p
          className="text-sm text-center mb-5"
          style={{ color: COLORS.muted }}
        >
          Enter OTP and new password
        </p>

        {/* Email (disabled) */}
        <div className="flex items-center border rounded-xl px-3 bg-[#F9F5F0] mb-3">
          <Mail size={18} className="text-[#7C6B51]" />
          <input
            value={email}
            disabled
            className="w-full bg-transparent p-3 outline-none text-gray-500"
          />
        </div>

        {/* OTP */}
        <div className="flex items-center border rounded-xl px-3 bg-[#F9F5F0] mb-3">
          <KeyRound size={18} className="text-[#7C6B51]" />
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full bg-transparent p-3 outline-none"
          />
        </div>

        {/* New Password */}
        <div className="flex items-center border rounded-xl px-3 bg-[#F9F5F0] mb-4">
          <Lock size={18} className="text-[#7C6B51]" />
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent p-3 outline-none"
          />
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 rounded-xl font-bold text-white"
          style={{ backgroundColor: COLORS.primary }}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default KitchenResetPassword;