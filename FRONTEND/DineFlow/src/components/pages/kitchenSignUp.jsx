import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, ClipboardList } from "lucide-react";
import API from "../../api/api"; 

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const KitchenSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");

      
      await API.post("/kitchen/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate("/kitchen/waiting-approval");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Signup failed"
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <ClipboardList size={30} color={COLORS.primary} />
          <h2
            className="text-2xl font-black"
            style={{ color: COLORS.text }}
          >
            Kitchen Sign Up
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <User
              size={18}
              className="absolute left-3 top-3.5 text-[#7C6B51]"
            />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 rounded-lg border border-[#7C6B51]/40 focus:outline-none focus:border-[#FC5C02]"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-3.5 text-[#7C6B51]"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 rounded-lg border border-[#7C6B51]/40 focus:outline-none focus:border-[#FC5C02]"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-3.5 text-[#7C6B51]"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 rounded-lg border border-[#7C6B51]/40 focus:outline-none focus:border-[#FC5C02]"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-3.5 text-[#7C6B51]"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 rounded-lg border border-[#7C6B51]/40 focus:outline-none focus:border-[#FC5C02]"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 text-center">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-bold transition"
            style={{ backgroundColor: COLORS.primary }}
          >
            Create Account
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-sm text-center mt-5"
          style={{ color: COLORS.muted }}
        >
          Already have an account?{" "}
          <span
            onClick={() => navigate("/kitchen/login")}
            className="font-bold cursor-pointer"
            style={{ color: COLORS.primary }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default KitchenSignup;
