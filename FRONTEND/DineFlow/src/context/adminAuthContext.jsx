import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // ✅ ADD THIS
import API from "../api/api";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // ✅ ADD

  const checkAuth = async () => {
    try {
      const res = await API.get("/admin/me");
      setAdmin(res.data.admin);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const publicRoutes = [
      "/admin/login",
      "/admin/forgot-password"
    ];

    if (publicRoutes.includes(location.pathname)) {
      setLoading(false); // 🔥 IMPORTANT
      return;
    }

    checkAuth();

  }, [location.pathname]); // ✅ track route change

  const logout = async () => {
    await API.post("/admin/logout");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, checkAuth, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);