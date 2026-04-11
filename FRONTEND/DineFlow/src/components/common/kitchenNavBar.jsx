import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Archive, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/api";

const COLORS = {
  primary: "#FC5C02",
  text: "#312B1E",
};

const KitchenNavbar = ({ historyOrders }) => {
  const navigate = useNavigate();

  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.get("/kitchen/is-auth"); 
      } catch {
        navigate("/kitchen/login");
      }
    };

    checkAuth();
  }, [navigate]);

  
  const handleLogout = async () => {
    try {
      await API.post("/kitchen/logout", {}, { withCredentials: true });
    } catch (e) {
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
      navigate("/kitchen/login");
    }, 1200);
  };

  return (
    <>
    <header className="bg-white shadow-sm px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      
      <div className="flex items-center gap-3">
        <ClipboardList size={26} color={COLORS.primary} />
        <h1
          className="text-lg md:text-xl font-black"
          style={{ color: COLORS.text }}
        >
          Kitchen Dashboard
        </h1>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
        
        <button
          onClick={() => navigate("/kitchen/orders")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FC5C02] text-white font-semibold whitespace-nowrap"
        >
          <ClipboardList size={16} />
          Orders
        </button>

        <button
          onClick={() =>
            navigate("/kitchen/history", {
              state: { historyOrders },
            })
          }
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F9F5F0] text-[#312B1E] font-semibold hover:bg-[#EFE7DB] whitespace-nowrap"
        >
          <Archive size={16} />
          History
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 whitespace-nowrap"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
    </>
  );
};

export default KitchenNavbar;



