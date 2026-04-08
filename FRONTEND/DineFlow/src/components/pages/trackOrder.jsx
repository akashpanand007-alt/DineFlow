import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Check } from "lucide-react";
import API from "../../api/api";
import socket from "../../socket";

const TrackOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const passedOrderId =
    location.state?.orderId ||
    location.state?.orderData?.orderId ||
    "";

  const passedEmail =
    location.state?.orderData?.customerEmail || null;

  const [orderId, setOrderId] = useState(passedOrderId);
  const [email, setEmail] = useState(passedEmail);
  const [status, setStatus] = useState("awaiting");
  const [tableId, setTableId] = useState(
    queryParams.get("tableId") || null
  );

  const joinedRef = useRef(false);

  // =========================
  // MAP BACKEND → UI STEP
  // =========================
  const mapStatus = (order) => {
    if (!order) return "awaiting";

    // 🔥 rejection priority
    if (order.orderStatus === "REJECTED") return "rejected";

    if (order.kitchenStatus === "PREPARING") return "preparing";
    if (order.kitchenStatus === "READY") return "ready";
    if (order.kitchenStatus === "SERVED") return "served";

    if (order.orderStatus === "CONFIRMED") return "approved";

    return "awaiting";
  };

  // =========================
  // INITIAL FETCH
  // =========================
  useEffect(() => {
    if (!orderId) return;

    API.get(`/orders/${orderId}`)
      .then((res) => {
        const order = res.data?.order;
        if (!order) return;

        setStatus(mapStatus(order));

        if (!email && order.customerEmail) {
          setEmail(order.customerEmail);
        }

        if (order.tableId?._id) {
          setTableId(order.tableId._id);
        }
      })
      .catch((err) => {
      });
  }, [orderId]);

  // =========================
  // SOCKET JOIN + LIVE UPDATE
  // =========================
  useEffect(() => {
    if (!email || !orderId) return;

    const normalizedEmail = email?.trim().toLowerCase();
const eventName = `customer_status_update_${normalizedEmail}`;

    if (!joinedRef.current) {
      socket.emit("join", {
  roomType: "customer",
  userId: normalizedEmail,
});
      joinedRef.current = true;
    }

    const handler = (order) => {
      if (String(order?._id) === String(orderId)) {
        setStatus(mapStatus(order));
      }
    };

    socket.off(eventName);
    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [email, orderId]);

  // =========================
  // STEP STATE HELPERS
  // =========================
  const isApproved = ["approved","preparing","ready","served"].includes(status);
  const isPreparing = ["preparing","ready","served"].includes(status);
  const isReady = ["ready","served"].includes(status);
  const isServed = status === "served";

  return (
    <div className="min-h-screen flex flex-col bg-[#E2CEAE] p-6 items-center">
      <h2 className="text-2xl font-bold text-[#312B1E] mb-4">
        Track Your Order
      </h2>

      {!orderId ? (
        <div className="w-full max-w-sm space-y-3">
          <input
            type="text"
            placeholder="Enter Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full p-3 rounded-xl outline-none border"
          />
        </div>
      ) : (
        <>
          <span className="text-sm text-[#7C6B51] mb-2">
            Order ID: <strong>{orderId}</strong>
          </span>

          {/* 🔴 REJECTED STATE */}
          {status === "rejected" && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl text-center w-full max-w-md">
              ❌ Your order has been rejected by the admin
            </div>
          )}

          {/* NORMAL FLOW */}
          {status !== "rejected" && (
            <div className="w-full max-w-md space-y-8">

              {status === "awaiting" && (
                <Step label="Awaiting Admin Approval" loading />
              )}

              {isApproved && (
                <Step
                  label="Admin Approved"
                  loading={status === "approved"}
                  done={status !== "approved"}
                />
              )}

              {isPreparing && (
                <Step
                  label={isReady ? "Prepared" : "Preparing"}
                  loading={status === "preparing"}
                  done={isReady}
                />
              )}

              {isReady && (
                <Step label="Ready" done />
              )}

              {isReady && (
                <Step
                  label="Served"
                  loading={status === "ready"}
                  done={isServed}
                />
              )}

            </div>
          )}
        </>
      )}

      <button
        onClick={() => {
          if (tableId) {
            navigate(`/order?tableId=${tableId}`);
          } else {
            navigate("/");
          }
        }}
        className="mt-8 bg-[#FC5C02] text-white py-3 px-8 rounded-xl font-bold"
      >
        Back to Menu
      </button>
    </div>
  );
};

const Step = ({ label, loading = false, done = false }) => {
  let bg = "bg-gray-300";
  let icon = <div className="w-4 h-4 rounded-full bg-gray-500" />;

  if (loading) {
    bg = "bg-[#FC5C02]";
    icon = <Loader2 className="animate-spin" size={18} />;
  } else if (done) {
    bg = "bg-green-500";
    icon = <Check size={18} />;
  }

  return (
    <div className="flex items-center gap-4">
      <div className={`${bg} text-white p-3 rounded-full`}>
        {icon}
      </div>
      <p className="font-semibold text-[#312B1E]">
        {label}
      </p>
    </div>
  );
};

export default TrackOrder;
