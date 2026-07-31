import React, { useEffect, useRef, useState, useCallback } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import API from "../../api/api";
import socket from "../../socket";
import { COLORS } from "../../constants/theme";

const SERVED_TIMEOUT = 5000;

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(Date.now());

  const alertSoundRef = useRef(null);

  const getAlertSound = useCallback(() => {
    if (!alertSoundRef.current) {
      alertSoundRef.current = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      );
    }
    return alertSoundRef.current;
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/kitchen/active");
        setOrders(res.data?.orders || []);
      } catch (e) {
        console.error("Failed to fetch active kitchen orders:", e);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const handleOrderApproved = (o) => {
      const mapped = {
        id: o._id,
        table: o.tableId?.number || "",
        items: o.items || [],
        instructions: o.instructions || "",
        paymentMethod: o.payment?.method || "",
        status: o.kitchenStatus || "WAITING",
      };

      setOrders((prev) =>
        [mapped, ...prev].sort((a, b) => (a.status === "PREPARING" ? -1 : 1))
      );
    };

    const handleStatusChanged = (o) => {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === o._id) {
            if (o.kitchenStatus === "SERVED") {
              setToast({
                id: o._id,
                table: ord.table,
              });

              return {
                ...ord,
                status: "SERVED",
                servedAt: Date.now(),
              };
            }

            return {
              ...ord,
              status: o.kitchenStatus,
            };
          }
          return ord;
        })
      );
    };

    socket.on("order_approved", handleOrderApproved);
    socket.on("order_status_changed", handleStatusChanged);

    return () => {
      socket.off("order_approved", handleOrderApproved);
      socket.off("order_status_changed", handleStatusChanged);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setOrders((prevOrders) => {
      const remainingOrders = [];

      prevOrders.forEach((order) => {
        if (order.status !== "SERVED" || !order.servedAt) {
          remainingOrders.push(order);
          return;
        }

        const expiry = order.servedAt + SERVED_TIMEOUT;

        if (now < expiry) {
          remainingOrders.push(order);
        }
      });

      return remainingOrders;
    });
  }, [now]);

  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const sound = getAlertSound();
    const hasWaiting = orders.some((order) => order.status === "WAITING");

    if (hasWaiting) {
      sound.loop = true;
      sound.play().catch(() => {});
    } else {
      sound.pause();
      sound.currentTime = 0;
    }

    return () => {
      sound.pause();
      sound.currentTime = 0;
    };
  }, [orders, getAlertSound]);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, {
        orderId: id,
        kitchenStatus: status,
      });
    } catch (e) {
      console.error("Failed to update status:", e);
    }

    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order))
    );
  };

  const statusColor = (status) => {
    switch (status) {
      case "WAITING":
        return "bg-yellow-50 border-yellow-500";
      case "PREPARING":
        return "bg-orange-50 border-orange-500";
      case "READY":
        return "bg-green-50 border-green-600";
      default:
        return "bg-gray-50 border-gray-300";
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: COLORS.bg }}
    >
      {toast && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 font-semibold">
          <CheckCircle2 size={18} />
          Order for Table {toast.table} served
        </div>
      )}

      <div className="p-4 md:p-6 flex-1">
        {orders.length === 0 && (
          <p className="text-center py-10" style={{ color: COLORS.muted }}>
            No active orders
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`border-l-4 ${statusColor(
                order.status
              )} bg-white rounded-2xl p-4 shadow-md flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span
                    className="font-bold text-sm md:text-base font-mono"
                    style={{ color: COLORS.text }}
                  >
                    #{order.id ? String(order.id).slice(-6) : "------"}
                  </span>
                  <span
                    className="text-xs md:text-sm font-semibold"
                    style={{ color: COLORS.muted }}
                  >
                    Table {order.table}
                  </span>
                </div>

                <ul className="mb-3 space-y-1 border-y py-2">
                  {order.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm flex justify-between"
                      style={{ color: COLORS.text }}
                    >
                      <span>{item.name}</span>
                      <span className="font-bold">
                        × {item.qty || item.quantity || 1}
                      </span>
                    </li>
                  ))}
                </ul>

                {order.instructions && (
                  <p className="text-xs text-orange-700 bg-orange-50 p-2 rounded-lg mb-3">
                    <strong>Note:</strong> {order.instructions}
                  </p>
                )}

                <p
                  className="text-xs mb-3"
                  style={{ color: COLORS.muted }}
                >
                  Payment:{" "}
                  <b style={{ color: COLORS.text }}>
                    {order.paymentMethod || "—"}
                  </b>
                </p>
              </div>

              <div>
                <div className="flex gap-2">
                  {order.status === "WAITING" && (
                    <button
                      onClick={() => updateStatus(order.id, "PREPARING")}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1 font-bold cursor-pointer transition-colors"
                    >
                      <Clock size={14} /> Start Preparing
                    </button>
                  )}

                  {order.status === "PREPARING" && (
                    <button
                      onClick={() => updateStatus(order.id, "READY")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1 font-bold cursor-pointer transition-colors"
                    >
                      <CheckCircle2 size={14} /> Ready
                    </button>
                  )}

                  {order.status === "READY" && (
                    <div className="flex-1 text-center text-green-700 font-bold text-sm py-2 bg-green-50 rounded-lg">
                      Waiting for admin to serve
                    </div>
                  )}

                  {order.status === "SERVED" && (
                    <div className="text-xs font-bold text-red-600 mt-2">
                      Admin served • Disappearing in{" "}
                      {order.servedAt
                        ? Math.max(
                            0,
                            Math.ceil((order.servedAt + SERVED_TIMEOUT - now) / 1000)
                          )
                        : 5}{" "}
                      s
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center gap-1 text-xs mt-3 capitalize"
                  style={{ color: COLORS.muted }}
                >
                  <Clock size={12} /> {order.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;
