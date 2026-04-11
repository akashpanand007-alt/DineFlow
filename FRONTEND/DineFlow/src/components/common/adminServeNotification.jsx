import React, { useEffect, useState, useRef } from "react";
import socket from "../../socket";
import API from "../../api/api";
import { BellRing, CheckCircle } from "lucide-react";

const AdminServeNotification = () => {
  const [order, setOrder] = useState(null);
  const [visible, setVisible] = useState(false);

  
  const soundRef = useRef(
    new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg")
  );

  useEffect(() => {
    const handleOrderStatusChanged = (updatedOrder) => {
      
      if (updatedOrder.kitchenStatus !== "READY") return;

      
      
      setOrder(updatedOrder);
      setVisible(true);

      
      soundRef.current.currentTime = 0;
    };

    const joinServiceRoom = () => {
      socket.emit("join_admin");
    };

    
    socket.on("order_status_changed", handleOrderStatusChanged);
    socket.on("connect", joinServiceRoom);

    if (socket.connected) {
      joinServiceRoom();
    }

    
    const checkReadyOrders = async () => {
      try {
        const res = await API.get("/orders/service/active");
        const ready = res.data.orders?.find(
          (o) => o.kitchenStatus === "READY"
        ); 

        if (ready) {
          setOrder(ready);
          setVisible(true);
        }
      } catch (err) {
      }
    };

    checkReadyOrders();

    return () => {
      socket.off("order_status_changed", handleOrderStatusChanged);
      socket.off("connect", joinServiceRoom);
    };
  }, []);

  const serveOrder = async () => {
    if (!order) return;

    try {
      const orderId = order._id || order.id;

      
      await API.put(`/orders/${orderId}/status`, {
  orderId: orderId,
  kitchenStatus: "SERVED",
});

      
      socket.emit("order_status_changed", {
        _id: orderId,
        status: "SERVED",
      });

      setVisible(false);
      setTimeout(() => setOrder(null), 300);

    } catch (err) {
    }
  };

  if (!visible || !order) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
        
        <div className="flex items-center gap-2 mb-2 text-green-600">
          <BellRing size={24} className="animate-bounce" />
          <h2 className="text-xl font-bold text-gray-800">
            Order Ready to Serve!
          </h2>
        </div>

        <p className="text-sm font-semibold text-gray-500 mb-4 bg-gray-100 inline-block px-3 py-1 rounded-full">
          Table {order?.tableId?.number || order?.table || "..."}
        </p>

        <div className="border-y py-3 mb-5 max-h-40 overflow-y-auto">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span className="text-gray-700">
                {item.name} <span className="font-bold text-gray-500">× {item.quantity}</span>
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={serveOrder}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 active:scale-95 transition-all"
        >
          <CheckCircle size={20} />
          Mark as Served
        </button>

      </div>
    </div>
  );
};

export default AdminServeNotification;