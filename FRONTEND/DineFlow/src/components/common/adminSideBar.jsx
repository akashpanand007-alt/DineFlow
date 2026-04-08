import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  ClipboardList,
  Utensils,
  LogOut,
  X,
  IndianRupee,
  Package,
  Table,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";   // ✅ added

const COLORS = {
  primary: "#FC5C02",
  text: "#312B1E",
};

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  // ✅ AUTH CHECK (runs once)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("/api/admin/is-auth", {
          withCredentials: true,
        });
      } catch {
        navigate("/admin/login");
      }
    };

    checkAuth();
  }, [navigate]);

  // ✅ BACKEND LOGOUT
  const handleLogout = async () => {
    try {
      await axios.post("/api/admin/logout", {}, { withCredentials: true });
    } catch (e) {
      // ignore — still redirect
    }

    toast.success("Logged out successfully", {
      duration: 2000,
      style: {
        background: "#312B1E",
        color: "#fff",
        borderRadius: "12px",
        padding: "12px 16px",
        fontWeight: "600",
      },
      iconTheme: {
        primary: "#FC5C02",
        secondary: "#fff",
      },
    });

    setTimeout(() => {
      navigate("/admin/login");
    }, 1200);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white shadow-xl p-6 z-50
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <BarChart3 size={28} color={COLORS.primary} />
              <h2 className="text-xl font-black text-[#312B1E]">
                Admin Panel
              </h2>
            </div>

            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={22} />
            </button>
          </div>

          <nav className="space-y-2">
            <SidebarLink
              to="/admin/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              closeSidebar={() => setSidebarOpen(false)}
            />

            <SidebarLink
              to="/admin/orders"
              icon={<ClipboardList size={18} />}
              label="Orders"
              closeSidebar={() => setSidebarOpen(false)}
            />

            <SidebarLink
              to="/admin/kitchens"
              icon={<Utensils size={18} />}
              label="Kitchens"
              closeSidebar={() => setSidebarOpen(false)}
            />

            <SidebarLink
              to="/admin/tables"
              icon={<Table size={18} />}
              label="Tables"
              closeSidebar={() => setSidebarOpen(false)}
            />

            <SidebarLink
              to="/admin/products"
              icon={<Package size={18} />}
              label="Products"
              closeSidebar={() => setSidebarOpen(false)}
            />

            <SidebarLink
              to="/admin/earnings"
              icon={<IndianRupee size={18} />}
              label="Earnings"
              closeSidebar={() => setSidebarOpen(false)}
            />
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
          text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
};

const SidebarLink = ({ to, icon, label, closeSidebar }) => (
  <NavLink
    to={to}
    end={to === "/admin/dashboard"}
    onClick={closeSidebar}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm
      ${
        isActive
          ? "bg-[#FC5C02]/10 font-semibold text-[#312B1E]"
          : "hover:bg-[#FC5C02]/5 text-[#7C6B51]"
      }`
    }
  >
    {icon}
    {label}
  </NavLink>
);

export default AdminSidebar;





