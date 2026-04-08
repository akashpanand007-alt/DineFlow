import React, { useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const KitchenForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [toast, setToast] = useState({
    show: false,
    type: "", // success | error
    message: "",
  });

  

  const handleSubmit = async () => {
    if (!email) {
      setToast({
        show: true,
        type: "error",
        message: "Email is required",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/otp/password-reset/request", {
  email,
  role: "kitchen"
});

      setToast({
  show: true,
  type: "success",
  message: res.data.message || "OTP sent to your email",
});

// 👇 ADD THIS
setTimeout(() => {
  navigate("/kitchen/reset-password", { state: { email } });
}, 1200);

      setEmail(""); // optional reset
    } catch (err) {
      setToast({
        show: true,
        type: "error",
        message:
          err.response?.data?.message || "Failed to send reset link",
      });
    }

    setLoading(false);

    // auto-hide toast
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
          Forgot Password
        </h2>

        <p
          className="text-sm text-center mb-5"
          style={{ color: COLORS.muted }}
        >
          Enter your registered email
        </p>

        <div className="flex items-center border rounded-xl px-3 bg-[#F9F5F0] mb-4">
          <Mail size={18} className="text-[#7C6B51]" />
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full bg-transparent p-3 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60 flex justify-center items-center"
          style={{ backgroundColor: COLORS.primary }}
        >
          {loading ? (
            <span className="animate-pulse">Sending...</span>
          ) : (
            "Send OTP"
          )}
        </button>
      </div>
    </div>
  );
};

export default KitchenForgotPassword;