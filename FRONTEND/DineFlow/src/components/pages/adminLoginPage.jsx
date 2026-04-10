import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, CheckCircle2 } from "lucide-react";
import API from "../../api/api";

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post(
        "/api/admin/login",   // ✅ fixed path
        { email, password },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setShowToast(true);

        setTimeout(() => {
          navigate("/admin/dashboard");
        });
      } else {
        setError(res.data?.message || "Invalid admin credentials");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid admin credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
  if (!email) {
    setError("Enter your email");
    return;
  }

  try {
    setLoading(true);
    setError("");

    await axios.post("/api/auth/password-reset/request", {
      email,
      role: "admin",
    });

    setStep(2);
  } catch (err) {
    setError(err.response?.data?.message || "Failed to send OTP");
  } finally {
    setLoading(false);
  }
};

const handleResetPassword = async () => {
  if (!otp || !newPassword) {
    setError("Fill all fields");
    return;
  }

  try {
    setLoading(true);
    setError("");

    await axios.post("/api/auth/password-reset/verify", {
      email,
      otp,
      newPassword,
      role: "admin",
    });

    setIsForgot(false);
    setStep(1);
    setOtp("");
    setNewPassword("");
    setPassword("");

    setShowToast(true);
  } catch (err) {
    setError(err.response?.data?.message || "Reset failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ backgroundColor: COLORS.bg }}
    >
      {showToast && (
        <div className="fixed top-6 right-6 z-[200]">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg bg-green-500 text-white font-semibold">
            <CheckCircle2 size={18} />
            Login successful
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-md">
        <div className="flex justify-center mb-4">
          <Shield size={50} color={COLORS.primary} />
        </div>

        <h2 className="text-center text-xl font-bold mb-1" style={{ color: COLORS.text }}>
          Admin Login
        </h2>

        <p className="text-center text-sm mb-6" style={{ color: COLORS.muted }}>
          Authorized personnel only
        </p>

        <div className="mb-4">
          <label className="text-sm font-medium" style={{ color: COLORS.muted }}>
            Email
          </label>
          <div className="flex items-center border rounded-xl px-3 mt-1 bg-[#F9F5F0]">
            <Mail size={18} className="text-[#7C6B51]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              className="w-full bg-transparent p-3 outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium" style={{ color: COLORS.muted }}>
            Password
          </label>
          <div className="flex items-center border rounded-xl px-3 mt-1 bg-[#F9F5F0]">
            <Lock size={18} className="text-[#7C6B51]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent p-3 outline-none"
            />
          </div>
          <p
  onClick={() => navigate("/admin/forgot-password")}
  className="text-sm text-red-500 cursor-pointer mt-2"
>
  Forgot Password?
</p>
        </div>

     

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

   <button
  onClick={handleLogin}
  disabled={loading}
  className="w-full py-3 rounded-xl font-bold text-white"
  style={{ backgroundColor: COLORS.primary }}
>
  {loading ? "Logging in..." : "Login"}
</button>
      </div>
    </div>
  );
};

export default AdminLogin;
