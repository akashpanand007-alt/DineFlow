import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Lock, Mail, CheckCircle2 } from "lucide-react";
import API from "../../api/api";
import socket from "../../socket";   // ✅ FIX: missing import

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const KitchenLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/kitchen/login", {
        email,
        password,
      });

      const status = res.data?.kitchen?.status || "approved";

      if (status === "approved") {
        const kitchen = res.data.kitchen;

        socket.emit("kitchen_online", kitchen._id); // unchanged

        localStorage.setItem("kitchen", JSON.stringify(kitchen));

        setShowToast(true);
        setTimeout(() => {
          navigate("/kitchen/orders");
        }, 1400);
      } else {
        setError("Account not active");
      }

      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message;

      if (msg === "Account not approved yet") {
        navigate("/kitchen/waiting-approval");
      } else {
        setError(msg || "Invalid credentials");
      }

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
          <ChefHat size={48} color={COLORS.primary} />
        </div>

        <h2
          className="text-center text-xl font-bold mb-1"
          style={{ color: COLORS.text }}
        >
          Kitchen Login
        </h2>

        <p
          className="text-center text-sm mb-6"
          style={{ color: COLORS.muted }}
        >
          Staff access only
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
              placeholder="kitchen@email.com"
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
        </div>

        <p
  onClick={() => navigate("/kitchen/forgot-password")}
  className="text-sm text-right cursor-pointer mb-2"
  style={{ color: COLORS.primary }}
>
  Forgot Password?
</p>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: COLORS.primary }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center mt-5" style={{ color: COLORS.muted }}>
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/kitchen/signup")}
            className="font-bold cursor-pointer"
            style={{ color: COLORS.primary }}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default KitchenLogin;