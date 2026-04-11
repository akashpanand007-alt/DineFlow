import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Menu,
  Inbox,
} from "lucide-react";
import API from "../../api/api";
import { io } from "socket.io-client";
import AdminSidebar from "../common/adminSideBar";

const socket = io("http://localhost:4000", {
  withCredentials: true,
});

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const AdminOrders = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: clean mapStatus (no component inside)
  const mapStatus = (status, kitchenStatus) => {
    const s = (status || "").toUpperCase();
    const ks = (kitchenStatus || "").toUpperCase();

    // ✅ ALWAYS check orderStatus FIRST
if (s === "COMPLETED") return "completed";

if (ks === "SERVED") return "served";
if (ks === "READY") return "ready";
    if (s === "CANCELLED") return "cancelled";
    if (s === "REJECTED") return "rejected";

    if (s === "CONFIRMED") return "live";

    if (s === "OTP_PENDING" || s === "OTP_VERIFIED") return "pending";

    return "pending";
  };

  const formatOrder = (o) => ({
  id: o._id,
  customer: o.customerName || "N/A",
  table: o.tableId?.number || o.table || "—",
  amount: o.totalAmount || o.amount || 0,
  status: mapStatus(o.orderStatus, o.kitchenStatus),
  rawStatus: o.orderStatus,
  kitchenStatus: o.kitchenStatus,
  paymentMethod: o.payment?.method || "—",
  paymentStatus: o.payment?.status || "PENDING", // ✅ ADD THIS
  date: new Date(o.createdAt).toLocaleDateString(),
});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders");
        const mapped = (res.data?.orders || []).map(formatOrder);
        setOrders(mapped);
      } catch (err) {
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
      socket.off("new_order_alert");
      socket.off("order_approved_admin");
      socket.off("order_rejected_admin");
      socket.off("order_status_changed");
      socket.off("payment_updated");
    };
  }, []);

  const handleApprove = async (id) => {
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
    }
  };

  const handleReject = async (id) => {
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
    }
  };

  const handleServe = async (id) => {
  setOrders((prev) =>
    prev.map((ord) =>
      ord.id === id
        ? {
            ...ord,
            status: "served",
            kitchenStatus: "SERVED",
            rawStatus: "SERVED" // ✅ ADD THIS
          }
        : ord
    )
  );

  try {
    await API.post("/orders/serve", { orderId: id });
  } catch (e) {
  }
};

  const handleMarkAsPaid = async (id) => {
  try {
    await API.patch(`/orders/mark-paid/${id}`);

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === id
          ? { ...ord, paymentStatus: "PAID" }
          : ord
      )
    );
  } catch (e) {
  }
};

const handleComplete = async (id) => {
  try {
    await API.post("/orders/complete", { orderId: id });

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === id
          ? {
              ...ord,
              status: "completed",
              rawStatus: "COMPLETED",
              kitchenStatus: "SERVED" // keep consistent
            }
          : ord
      )
    );
  } catch (e) {
  }
};

const UnpaidRow = ({ order, onMarkPaid }) => {
  return (
    <div className="flex justify-between items-center bg-red-50 border border-red-200 rounded-xl p-3">
      <div>
        <p className="font-semibold">
          #{order.id?.toString().slice(-6) || "------"} - {order.customer}
        </p>
        <p className="text-xs text-gray-500">
          Table: {order.table} | ₹{order.amount}
        </p>
      </div>

      {!["CANCELLED", "REJECTED"].includes(order.rawStatus) && (
  <button
    onClick={() => onMarkPaid(order.id)}
    className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg"
  >
    Mark Paid
  </button>
)}
    </div>
  );
};

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      activeFilter === "all" || order.status === activeFilter;

    const matchesSearch =
      order.id?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // ✅ NEW (only logic added)
  const unpaidOrders = filteredOrders.filter(
  (o) =>
    o.paymentStatus !== "PAID" &&
    !["CANCELLED", "REJECTED"].includes(o.rawStatus)
);

  const normalOrders = filteredOrders.filter(
  (o) => o.paymentStatus === "PAID"
);
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

          

            {/* 🔴 NEW: UNPAID SECTION */}
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
                    className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all
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
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-[#FC5C02]/40 transition"
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
                          <td className="py-4 px-4 font-semibold font-mono text-xs">#{order.id.slice(-6)}</td>
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
    className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
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
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(order.id)}
                                  className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {order.kitchenStatus === "READY" && (
                              <button
                                onClick={() => handleServe(order.id)}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                Serve
                              </button>
                            )}

                            {order.kitchenStatus === "SERVED" && order.rawStatus !== "COMPLETED" && (
  <button
    onClick={() => handleComplete(order.id)}
    className="px-3 py-1 text-xs bg-green-700 text-white rounded-lg"
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
                          <p className="font-bold text-sm font-mono">#{order.id.slice(-6)}</p>
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

const StatusBadge = ({ status }) => {
  const styles = {
  live: "bg-yellow-100 text-yellow-700",
  ready: "bg-blue-100 text-blue-700",
  served: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-gray-200 text-gray-700",
  pending: "bg-gray-100 text-gray-600"
};

  const icons = {
    live: <Clock size={14} />,
    ready: <Clock size={14} />,
    served: <CheckCircle2 size={14} />,
    completed: <CheckCircle2 size={14} />,
    cancelled: <XCircle size={14} />,
    rejected: <XCircle size={14} />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {icons[status]} {status}
    </span>
  );
};

export default AdminOrders;