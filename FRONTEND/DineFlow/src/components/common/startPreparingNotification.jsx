import React, { useEffect, useState } from "react";
import socket from "../../socket";
import API from "../../api/api";
import { Flame } from "lucide-react";

const KitchenLiveNotification = () => {
  const [order, setOrder] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
  const handleOrderApproved = (order) => {
    setOrder(order);
    setVisible(true);
  };

  const joinKitchen = () => {
    socket.emit("join_kitchen");
  };

  // ✅ ONLY attach listeners (no manual connect)
  socket.on("connect", joinKitchen);
  socket.on("order_approved", handleOrderApproved);
  socket.on("order_approved_global", handleOrderApproved);

  // ✅ Join immediately if already connected
  if (socket.connected) {
    joinKitchen();
  }

  // ✅ API fallback
  const checkWaitingOrders = async () => {
    try {
      const res = await API.get("/orders/kitchen/active");

      const waiting = res.data.orders?.find(
        (o) => o.kitchenStatus === "WAITING"
      );

      if (waiting) {
        setOrder(waiting);
        setVisible(true);
      }
    } catch (err) {}
  };

  checkWaitingOrders();

  return () => {
    // ✅ SAFE CLEANUP
    socket.off("order_approved", handleOrderApproved);
    socket.off("order_approved_global", handleOrderApproved);
    socket.off("connect", joinKitchen);
  };
}, []);

  const startPreparing = async () => {
  if (!order) return;

  try {
    const orderId = order._id || order.id;

await API.put(`/orders/${orderId}/status`, {
      kitchenStatus: "PREPARING",
    });

    // notify other kitchen screens
    socket.emit("order_status_changed", {
      _id: order._id,
      kitchenStatus: "PREPARING",
    });

    setVisible(false);
    setTimeout(() => setOrder(null), 300);

  } catch (err) {
  }
};

  if (!visible || !order) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">

        <h2 className="text-lg font-bold mb-2">
          New Order for Kitchen
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Table {order?.tableId?.number || order?.table || "..."}
        </p>

        <div className="border-y py-3 mb-4 max-h-40 overflow-y-auto">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-semibold">
                ₹{item.price}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={startPreparing}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#FC5C02] text-white rounded-xl font-semibold hover:bg-orange-700"
        >
          <Flame size={18} />
          Start Preparing
        </button>

      </div>
    </div>
  );
};

export default KitchenLiveNotification;