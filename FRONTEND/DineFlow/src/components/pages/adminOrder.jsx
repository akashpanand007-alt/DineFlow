import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ClipboardList,
  Search,
  IndianRupee,
  Menu,
  Inbox,
} from "lucide-react";
import API from "../../api/api";
import AdminSidebar from "../common/adminSideBar";
import socket from "../../socket";
import StatusBadge from "../common/StatusBadge";
import { COLORS } from "../../constants/theme";
import { formatOrder } from "../../utils/formatOrder";

const AdminOrders = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders");
        const mapped = (res.data?.orders || []).map(formatOrder).filter(Boolean);
        setOrders(mapped);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    socket.emit("join", { roomType: "admin" });

    const updateOrAddOrder = (o) => {
      const formatted = formatOrder(o);
      if (!formatted) return;

      setOrders((prev) => {
        const exists = prev.some((ord) => ord.id === formatted.id);
        if (exists) {
          return prev.map((ord) =>
            ord.id === formatted.id ? { ...ord, ...formatted } : ord
          );
        }
        return [formatted, ...prev];
      });
    };

    socket.on("new_order_alert", updateOrAddOrder);
    socket.on("order_approved_admin", updateOrAddOrder);
    socket.on("order_rejected_admin", updateOrAddOrder);
    socket.on("order_status_changed", updateOrAddOrder);
    socket.on("payment_updated", updateOrAddOrder);

    return () => {
      socket.off("new_order_alert", updateOrAddOrder);
      socket.off("order_approved_admin", updateOrAddOrder);
      socket.off("order_rejected_admin", updateOrAddOrder);
      socket.off("order_status_changed", updateOrAddOrder);
      socket.off("payment_updated", updateOrAddOrder);
    };
  }, []);

  const handleApprove = useCallback(async (id) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === id
          ? { ...ord, status: "live", rawStatus: "CONFIRMED" }
          : ord
      )
    );
    try {
      await API.post("/orders/approve", { orderId: id });
    } catch (e) {
      console.error("Failed to approve order:", e);
    }
  }, []);

  const handleReject = useCallback(async (id) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === id
          ? { ...ord, status: "rejected", rawStatus: "REJECTED" }
          : ord
      )
    );
    try {
      await API.post("/orders/reject", { orderId: id });
    } catch (e) {
      console.error("Failed to reject order:", e);
    }
  }, []);

  const handleServe = useCallback(async (id) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === id
          ? {
              ...ord,
              status: "served",
              kitchenStatus: "SERVED",
              rawStatus: "SERVED",
            }
          : ord
      )
    );

    try {
      await API.post("/orders/serve", { orderId: id });
    } catch (e) {
      console.error("Failed to serve order:", e);
    }
  }, []);

  const handleMarkAsPaid = useCallback(async (id) => {
    try {
      await API.patch(`/orders/mark-paid/${id}`);

      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === id ? { ...ord, paymentStatus: "PAID" } : ord
        )
      );
    } catch (e) {
      console.error("Failed to mark order as paid:", e);
    }
  }, []);

  const handleComplete = useCallback(async (id) => {
    try {
      await API.post("/orders/complete", { orderId: id });

      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === id
            ? {
                ...ord,
                status: "completed",
                rawStatus: "COMPLETED",
                kitchenStatus: "SERVED",
              }
            : ord
        )
      );
    } catch (e) {
      console.error("Failed to complete order:", e);
    }
  }, []);

  const filteredOrders = useMemo(() => {
    const searchLower = search.toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        activeFilter === "all" || order.status === activeFilter;

      const matchesSearch =
        order.id?.toLowerCase().includes(searchLower) ||
        order.customer?.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [orders, activeFilter, search]);

  const unpaidOrders = useMemo(() => {
    return filteredOrders.filter(
      (o) =>
        o.paymentStatus !== "PAID" &&
        !["CANCELLED", "REJECTED"].includes(o.rawStatus)
    );
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: COLORS.bg }}>
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 min-w-0 p-3 sm:p-5 md:p-8">
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} color={COLORS.text} />
          </button>
          <h1 className="font-bold text-lg">Orders</h1>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="p-3 rounded-2xl bg-[#FC5C02]/10 w-fit">
              <ClipboardList size={26} color={COLORS.primary} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#312B1E]">
                Orders Management
              </h1>
              <p className="text-sm text-[#7C6B51]">
                Monitor and manage all platform orders
              </p>
            </div>
          </div>

          {/* UNPAID SECTION */}
          {unpaidOrders.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-red-600 mb-3">
                ⚠ Unpaid Orders ({unpaidOrders.length})
              </h2>

              <div className="space-y-2">
                {unpaidOrders.map((order) => (
                  <UnpaidRow
                    key={order.id}
                    order={order}
                    onMarkPaid={handleMarkAsPaid}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-lg">
            {/* Filters */}
            <div className="flex overflow-x-auto gap-2 sm:gap-3 mb-5 sm:mb-6 pb-2">
              {["all", "live", "ready", "served", "completed", "cancelled", "rejected"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setActiveFilter(status)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer
                    ${
                      activeFilter === status
                        ? "bg-[#FC5C02] text-white shadow-md"
                        : "bg-[#FC5C02]/10 text-[#312B1E] hover:bg-[#FC5C02]/20"
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                )
              )}
            </div>

            {/* Search */}
            <div className="relative mb-6 sm:mb-8">
              <Search size={18} className="absolute left-4 top-3.5 text-[#7C6B51]" />
              <input
                type="text"
                placeholder="Search by Order ID or Customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FC5C02]/40 transition"
              />
            </div>

            {/* CONTENT AREA */}
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#7C6B51]">
                <Inbox size={48} strokeWidth={1.5} className="mb-4 text-gray-300" />
                <p className="text-lg font-semibold">
                  {search ? "No orders match your search" : "No orders found"}
                </p>
                <p className="text-sm mt-1">
                  {search ? "Try a different search term" : "New orders will appear here"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block w-full overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead className="bg-[#FC5C02]/5 text-[#7C6B51]">
                      <tr>
                        <th className="py-4 px-4 text-left">Order ID</th>
                        <th className="px-4 text-left">Customer</th>
                        <th className="px-4 text-left">Table</th>
                        <th className="px-4 text-left">Amount</th>
                        <th className="px-4 text-left">Status</th>
                        <th className="px-4 text-left">Date</th>
                        <th className="px-4 text-left">Payment</th>
                        <th className="px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-t hover:bg-[#FC5C02]/5">
                          <td className="py-4 px-4 font-semibold font-mono text-xs">
                            #{order.id ? String(order.id).slice(-6) : "------"}
                          </td>
                          <td className="px-4">{order.customer}</td>
                          <td className="px-4">{order.table}</td>
                          <td className="px-4">
                            <div className="flex items-center gap-1">
                              <IndianRupee size={14} /> {order.amount}
                            </div>
                          </td>
                          <td className="px-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-4 text-[#7C6B51]">{order.date}</td>
                          <td className="px-4">
                            {order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}

                            {order.paymentStatus !== "PAID" &&
                              !["CANCELLED", "REJECTED"].includes(order.rawStatus) && (
                                <button
                                  onClick={() => handleMarkAsPaid(order.id)}
                                  className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
                                >
                                  Mark Paid
                                </button>
                              )}
                          </td>
                          <td className="px-4">
                            {order.rawStatus === "OTP_VERIFIED" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(order.id)}
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(order.id)}
                                  className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {order.kitchenStatus === "READY" && (
                              <button
                                onClick={() => handleServe(order.id)}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                              >
                                Serve
                              </button>
                            )}

                            {order.kitchenStatus === "SERVED" &&
                              order.rawStatus !== "COMPLETED" && (
                                <button
                                  onClick={() => handleComplete(order.id)}
                                  className="px-3 py-1 text-xs bg-green-700 text-white rounded-lg hover:bg-green-800 cursor-pointer"
                                >
                                  Complete
                                </button>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-sm font-mono">
                            #{order.id ? String(order.id).slice(-6) : "------"}
                          </p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="space-y-1 text-sm text-[#312B1E] mb-4">
                        <p><span className="text-gray-500">Customer:</span> <b>{order.customer}</b></p>
                        <p><span className="text-gray-500">Table:</span> <b>{order.table}</b></p>
                        <p className="flex items-center gap-1">
                          <span className="text-gray-500">Total:</span> <IndianRupee size={12}/> <b>{order.amount}</b>
                        </p>
                      </div>

                      {/* Mobile Actions */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                        {order.rawStatus === "OTP_VERIFIED" && (
                          <>
                            <button
                              onClick={() => handleReject(order.id)}
                              className="px-4 py-2 text-xs bg-red-100 text-red-700 rounded-lg font-semibold"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(order.id)}
                              className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg font-semibold"
                            >
                              Accept
                            </button>
                          </>
                        )}
                        {order.kitchenStatus === "READY" && (
                          <button
                            onClick={() => handleServe(order.id)}
                            className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg font-semibold w-full"
                          >
                            Mark as Served
                          </button>
                        )}

                        {order.paymentStatus !== "PAID" &&
                          !["CANCELLED", "REJECTED"].includes(order.rawStatus) && (
                            <button
                              onClick={() => handleMarkAsPaid(order.id)}
                              className="px-4 py-2 text-xs bg-green-500 text-white rounded-lg font-semibold"
                            >
                              Mark Paid
                            </button>
                          )}

                        {order.kitchenStatus === "SERVED" && order.rawStatus !== "COMPLETED" && (
                          <button
                            onClick={() => handleComplete(order.id)}
                            className="px-4 py-2 text-xs bg-green-700 text-white rounded-lg font-semibold"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const UnpaidRow = React.memo(({ order, onMarkPaid }) => {
  return (
    <div className="flex justify-between items-center bg-red-50 border border-red-200 rounded-xl p-3">
      <div>
        <p className="font-semibold text-sm">
          #{order.id ? String(order.id).slice(-6) : "------"} - {order.customer}
        </p>
        <p className="text-xs text-gray-500">
          Table: {order.table} | ₹{order.amount}
        </p>
      </div>

      {!["CANCELLED", "REJECTED"].includes(order.rawStatus) && (
        <button
          onClick={() => onMarkPaid(order.id)}
          className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 cursor-pointer"
        >
          Mark Paid
        </button>
      )}
    </div>
  );
});
UnpaidRow.displayName = "UnpaidRow";

export default AdminOrders;