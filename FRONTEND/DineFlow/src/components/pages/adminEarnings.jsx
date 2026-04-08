import React, { useState, useEffect } from "react";
import {
  IndianRupee,
  Search,
  Menu,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import AdminSidebar from "../common/adminSideBar";
import API from "../../api/api";

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const AdminEarnings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("today");
  const [earnings, setEarnings] = useState([]);
  const [kitchens, setKitchens] = useState([]); // ✅ added

  /* ===== FETCH KITCHENS ===== */
  useEffect(() => {
    const fetchKitchens = async () => {
      try {
        const res = await API.get("/admin/kitchens");
        setKitchens(res.data?.kitchens || []);
      } catch (e) {
      }
    };
    fetchKitchens();
  }, []);

  /* ===== FETCH FROM BACKEND ===== */
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await API.get("/admin/dashboard");
        const data = res.data;

        const source =
          range === "today"
            ? [data.daily]
            : range === "week"
            ? data.weekly
            : range === "month"
            ? data.monthly
            : data.yearly;

        const normalized = (source || []).map((e, i) => ({
  id: i,
  kitchen: kitchens[0]?.name || "Kitchen", // only 1 kitchen now
  orders: e.totalOrders || 0,
  completed: e.completedOrders ?? e.totalOrders ?? 0,
  amount: e.totalEarnings || 0,
  date: e._id || new Date().toISOString().slice(0, 10),
  status: "settled",
}));

        setEarnings(normalized);
      } catch (e) {
      }
    };

    if (kitchens.length) fetchEarnings();
  }, [range, kitchens]);

  const today = new Date().toISOString().slice(0, 10);

  const isSameWeek = (d) => {
    const diff =
      (new Date(today) - new Date(d)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  };

  const isSameMonth = (d) => {
    const t = new Date(today);
    const dt = new Date(d);
    return (
      t.getMonth() === dt.getMonth() &&
      t.getFullYear() === dt.getFullYear()
    );
  };

  const isSameYear = (d) => {
    return new Date(d).getFullYear() === new Date(today).getFullYear();
  };

  const rangeFiltered = earnings;

  const filtered = rangeFiltered.filter((e) =>
  e.kitchen.toLowerCase().includes(search.toLowerCase())
);

  const totalRevenue = rangeFiltered.reduce((s, e) => s + e.amount, 0);
  const totalOrders = rangeFiltered.reduce((s, e) => s + e.orders, 0);
  const settledCount = rangeFiltered.reduce((s, e) => s + e.completed, 0);

  const revenueTitle =
    range === "today"
      ? "Today's Revenue"
      : range === "week"
      ? "Weekly Revenue"
      : range === "month"
      ? "Monthly Revenue"
      : "Yearly Revenue";

  return (
    <div
      className="flex min-h-screen w-full"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} color={COLORS.text} />
          </button>
          <h1 className="font-bold text-lg">Earnings</h1>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-2xl bg-[#FC5C02]/10">
                <IndianRupee size={26} color={COLORS.primary} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#312B1E]">
                  Earnings Overview
                </h1>
                <p className="text-xs sm:text-sm text-[#7C6B51]">
                  Monitor platform revenue & settlements
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <KpiCard title={revenueTitle} value={`₹ ${totalRevenue}`} />
            <KpiCard title="Total Orders" value={totalOrders} />
            <KpiCard title="Settled Orders" value={settledCount} />
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              {["today", "week", "month", "year"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition
                  ${
                    range === r
                      ? "bg-[#FC5C02] text-white shadow"
                      : "bg-[#FC5C02]/10 text-[#312B1E]"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative mb-6 sm:mb-8">
              <Search size={18} className="absolute left-4 top-3.5 text-[#7C6B51]" />
              <input
                type="text"
                placeholder="Search kitchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-[#FC5C02]/40"
              />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm min-w-[620px]">
                <thead className="bg-[#FC5C02]/5 text-[#7C6B51]">
                  <tr>
                    <th className="py-3 px-4 text-left">Kitchen</th>
                    <th className="px-4 text-center">Orders</th>
                    <th className="px-4 text-center">Amount</th>
                    <th className="px-4 text-left">Date</th>
                    <th className="px-4 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id} className="border-t hover:bg-[#FC5C02]/5">
                      <td className="py-3 px-4 font-semibold text-[#312B1E]">
                        {e.kitchen}
                      </td>
                      <td className="px-4 text-center">{e.completed}</td>
                      <td className="px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <IndianRupee size={14} />
                          {e.amount}
                        </div>
                      </td>
                      <td className="px-4 text-[#7C6B51]">{e.date}</td>
                      <td className="px-4">
                        <StatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-10 text-[#7C6B51] text-sm">
                No earnings found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const KpiCard = ({ title, value }) => (
  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-md">
    <p className="text-sm text-[#7C6B51]">{title}</p>
    <h2 className="text-2xl font-bold text-[#312B1E] mt-1">{value}</h2>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    settled: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  const icons = {
    settled: <CheckCircle2 size={14} />,
    pending: <Calendar size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-semibold ${styles[status]}`}
    >
      {icons[status]}
      {status}
    </span>
  );
};

export default AdminEarnings;



