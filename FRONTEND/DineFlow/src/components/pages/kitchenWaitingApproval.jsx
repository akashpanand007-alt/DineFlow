import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, LogOut, ShieldAlert } from "lucide-react";
import API from "../../api/api"; // ✅ added

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const KitchenWaitingApproval = () => {
  const navigate = useNavigate();

  // ✅ CHECK APPROVAL STATUS
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await API.get("/kitchen/is-auth");

        const kitchen = res.data?.kitchen;

        if (!kitchen) return;

        // if approved → go dashboard
        if (kitchen.status === "approved") {
          navigate("/kitchen/dashboard");
        }

        // if rejected/deactivated → back to login
        if (
          kitchen.status === "rejected" ||
          kitchen.status === "deactivated"
        ) {
          navigate("/kitchen/login");
        }
      } catch (err) {
        // not logged in → login
        navigate("/kitchen/login");
      }
    };

    checkStatus();
  }, [navigate]);

  // ✅ LOGOUT API
  const handleLogout = async () => {
    try {
      await API.post("/kitchen/logout");
    } catch (e) {}

    navigate("/kitchen/login");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <ShieldAlert size={60} color="#FC5C02" />
        </div>

        {/* Title */}
        <h2
          className="text-2xl font-black mb-3"
          style={{ color: COLORS.text }}
        >
          Awaiting Admin Approval
        </h2>

        {/* Description */}
        <p
          className="text-sm mb-6"
          style={{ color: COLORS.muted }}
        >
          Your kitchen account has been created successfully.
          <br />
          Please wait for the admin to approve your access.
        </p>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
            <Clock size={16} />
            Status: Pending Approval
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            className="w-full py-3 rounded-lg text-white font-bold"
            style={{ backgroundColor: COLORS.primary }}
            onClick={() => window.location.reload()}
          >
            Check Approval Status
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-lg bg-red-100 text-red-700 font-semibold flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default KitchenWaitingApproval;

