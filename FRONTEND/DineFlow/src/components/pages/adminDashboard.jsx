import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Menu,
  CheckCircle2,
  Clock,
  Ban,
  IndianRupee,
  ClipboardList,
  Users,
} from "lucide-react";
import API from "../../api/api";
import socket from "../../socket";
import AdminSidebar from "../common/adminSideBar";
import LoadingPage from "../layout/loading";


const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
};

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboardStats, setDashboardStats] = useState({
    liveOrders: 0,
    todaysEarnings: 0,
    approvedKitchens: 0,
    activeKitchens: 0,
    rejectedOrders: 0,
    pendingKitchens: 0,
    cancelledOrders: 0,
    occupiedTables: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTables, setRecentTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  

  const handleAcceptOrder = async (orderId) => {
    setRecentOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, status: "CONFIRMED", orderStatus: "CONFIRMED" } : o
      )
    );
    try {
      await API.post("/orders/approve", { orderId });
    } catch (err) {
      setRecentOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: "OTP_VERIFIED", orderStatus: "OTP_VERIFIED" } : o
        )
      );
    }
  };

  const handleServeOrder = async (orderId) => {
  try {
    await API.post("/orders/serve", { orderId });
  } catch (err) {
  }
};

const handleMarkAsPaid = async (orderId) => {
  try {
    await API.patch(`/orders/mark-paid/${orderId}`);

    setRecentOrders((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? { ...o, paymentStatus: "PAID" }
          : o
      )
    );
  } catch (err) {
  }
};

const handleCompleteOrder = async (orderId) => {
  
  setRecentOrders((prev) =>
    prev.map((o) =>
      o._id === orderId
        ? {
            ...o,
            orderStatus: "COMPLETED",
            status: "COMPLETED",
            kitchenStatus: "SERVED",
          }
        : o
    )
  );

  try {
    await API.post("/orders/complete", { orderId });
  } catch (err) {
  }
};
  

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/admin/dashboard");
        const data = res.data;

        setDashboardStats({
          liveOrders: data?.liveOrders ?? 0,
          todaysEarnings: data?.todaysEarnings ?? 0,
          approvedKitchens: data?.approvedKitchens ?? data?.activeKitchens ?? 0,
          activeKitchens: data?.activeKitchens ?? 0,
          rejectedOrders: data?.rejectedOrders ?? 0,
          pendingKitchens: data?.pendingKitchens ?? 0,
          cancelledOrders: data?.cancelledOrders ?? 0,
          occupiedTables: data?.occupiedTables ?? 0,
        });

        setRecentOrders(data?.recentOrders ?? []);
        setRecentTables(data?.recentTables ?? []);
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  

  useEffect(() => {
    

    const upsertOrder = (order) => {
      setRecentOrders((prev) => {
        const exists = prev.some((o) => o._id === order._id);

        
        let tableDisplay = "—";
        if (typeof order.tableId === 'string') {
            tableDisplay = order.tableId;
        } else if (order.tableId?.number) {
            tableDisplay = order.tableId.number;
        } else if (order.table) {
            tableDisplay = order.table;
        }

        const normalizedOrder = {
  ...order,
  _id: order._id,
  status: order.orderStatus || order.status,
  kitchenStatus: order.kitchenStatus || "",
  tableId: tableDisplay,
  amount: order.totalAmount || order.amount || 0,
  paymentMethod: order.payment?.method || "—",
  paymentStatus: order.payment?.status || "—"   
};

        if (exists) {
          return prev.map((o) =>
            o._id === order._id ? { ...o, ...normalizedOrder } : o
          );
        }
        return [normalizedOrder, ...prev];
      });
    };

    const handleActiveKitchens = (count) => {
      setDashboardStats((prev) => ({
        ...prev,
        activeKitchens: count,
      }));
    };

    socket.on("new_order_alert", upsertOrder);
    socket.on("order_approved_admin", upsertOrder);
    socket.on("order_status_changed", upsertOrder);
    socket.on("active_kitchens_update", handleActiveKitchens);

    return () => {
      socket.off("new_order_alert", upsertOrder);
      socket.off("order_approved_admin", upsertOrder);
      socket.off("order_status_changed", upsertOrder);
      socket.off("active_kitchens_update", handleActiveKitchens);
    };
  }, []);

  if (loading) return <LoadingPage />;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: COLORS.bg }}>
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 min-w-0 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} color={COLORS.text} />
          </button>
          <h1 className="font-bold text-lg">Dashboard</h1>
        </div>

        <DashboardHeader />
        <StatsGrid stats={dashboardStats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders
  orders={recentOrders}
  onAccept={handleAcceptOrder}
  onServe={handleServeOrder}
  onMarkPaid={handleMarkAsPaid}
  onComplete={handleCompleteOrder}
/>
          <RecentTables tables={recentTables} />
        </div>
      </main>
    </div>
  );
};



const DashboardHeader = () => (
  <div className="mb-10">
    <div className="flex items-center gap-3 p-5 rounded-3xl shadow-lg bg-gradient-to-br from-[#FC5C0222] to-white">
      <BarChart3 size={32} color="#FC5C02" />
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#312B1E]">
          Admin Dashboard
        </h1>
        <p className="text-sm mt-1 text-[#7C6B51]">
          Real-time Overview & Performance
        </p>
      </div>
    </div>
  </div>
);

const StatsGrid = ({ stats }) => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <SummaryCard icon={<ClipboardList />} title="Live Orders" value={stats.liveOrders} />
      <SummaryCard icon={<IndianRupee />} title="Today's Earnings" value={`₹ ${stats.todaysEarnings}`} />
      <SummaryCard icon={<CheckCircle2 />} title="Approved Kitchens" value={stats.approvedKitchens} />
      <SummaryCard icon={<Users />} title="Active Kitchens" value={stats.activeKitchens} />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
      <SummaryCard icon={<Clock />} title="Pending Kitchens" value={stats.pendingKitchens} />
      <SummaryCard icon={<Ban />} title="Cancelled Orders" value={stats.cancelledOrders} />
      <SummaryCard icon={<Users />} title="Occupied Tables" value={stats.occupiedTables} />
    </div>
  </>
);

const SummaryCard = ({ icon, title, value }) => (
  <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg">
    <div className="flex items-center gap-2 mb-3 text-[#7C6B51]">
      {icon}
      <span className="font-semibold">{title}</span>
    </div>
    <h2 className="text-3xl font-bold text-[#312B1E]">{value}</h2>
  </div>
);

const RecentOrders = ({ orders, onAccept, onServe, onMarkPaid, onComplete }) => {
  return (
    <RecentCard title="Recent Orders">
      {orders.length === 0 ? (
        <p className="text-sm text-[#7C6B51]">No recent orders</p>
      ) : (
        orders.map((o) => {
          const rawStatus = (o.orderStatus || o.status || "").toUpperCase();

const kitchenStatus = (o.kitchenStatus || "").toUpperCase();
const paymentLabel =
  o.paymentStatus === "PAID" ? "Paid" : "Unpaid";

let status = "pending";


if (rawStatus === "COMPLETED") status = "completed";
else if (rawStatus === "CREATED") status = "pending";
else if (rawStatus === "CONFIRMED") status = "live";
else if (rawStatus === "OTP_PENDING") status = "pending";
else if (rawStatus === "OTP_VERIFIED") status = "pending";
else if (rawStatus === "CANCELLED") status = "cancelled";
else if (rawStatus === "REJECTED") status = "rejected";


if (rawStatus !== "COMPLETED") {
  if (kitchenStatus === "READY") status = "ready";
  if (kitchenStatus === "SERVED") status = "served";
}
          
          const tableName = o.table || o.tableId || "—";
          const displayAmount = o.amount ?? o.totalAmount ?? 0;

          return (
            <RowItem
  key={o._id}

  

label={`${tableName} • ₹${displayAmount} • ${paymentLabel}`}
  status={status}
              action={
  <>
    {status === "OTP_VERIFIED" && (
      <button
        onClick={() => onAccept(o._id)}
        className="ml-3 px-3 py-1 text-xs bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
      >
        Accept
      </button>
    )}

    {kitchenStatus === "READY" && (
      <button
        onClick={() => onServe(o._id)}
        className="ml-3 px-3 py-1 text-xs bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Serve
      </button>
    )}

    {kitchenStatus === "SERVED" &&
 !["COMPLETED", "CANCELLED", "REJECTED"].includes(rawStatus) && (
  <button
    onClick={() => onComplete(o._id)}
    className="ml-3 px-3 py-1 text-xs bg-green-700 text-white rounded-lg"
  >
    Complete
  </button>
)}

    {/* ✅ NEW: Mark as Paid */}
{o.paymentStatus !== "PAID" &&
 !["CANCELLED", "REJECTED"].includes(rawStatus) && (
  <button
    onClick={() => onMarkPaid(o._id)}
    className="ml-3 px-3 py-1 text-xs bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
  >
    Mark Paid
  </button>
)}
  </>
}
            />
          );
        })
      )}
    </RecentCard>
  );
};

const RecentTables = ({ tables }) => (
  <RecentCard title="Table Status">
    {tables.length === 0 ? (
      <p className="text-sm text-[#7C6B51]">No tables active</p>
    ) : (
      tables.map((t, i) => (
        <RowItem
          key={t._id || i}
          label={`Table ${t.number || "—"}`}
          status={(t.status || "").toLowerCase()}
        />
      ))
    )}
  </RecentCard>
);

const RecentCard = ({ title, children }) => (
  <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg">
    <h3 className="text-lg font-bold mb-4 text-[#312B1E]">{title}</h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const RowItem = ({ label, status, action }) => {
  const styles = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-green-100 text-green-700",
  created: "bg-blue-100 text-blue-700",
  otp_verified: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  occupied: "bg-red-100 text-red-700",
  available: "bg-green-100 text-green-700",
  served: "bg-green-100 text-green-700",
  ready: "bg-blue-100 text-blue-700",
  live: "bg-yellow-100 text-yellow-700"
};

  return (
    <div className="flex justify-between items-center border-b border-gray-100 last:border-0 py-2">
      <span className="text-[#312B1E] font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1 text-xs rounded-full font-semibold capitalize ${
            styles[status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
        {action}
      </div>
    </div>
  );
};

export default AdminDashboard;
