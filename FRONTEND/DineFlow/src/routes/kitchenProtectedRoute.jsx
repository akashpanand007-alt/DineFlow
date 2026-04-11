import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";

const KitchenProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.get("/kitchen/is-auth");
        setIsAuth(true);
      } catch {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return null; // or loader

  return isAuth ? <Outlet /> : <Navigate to="/kitchen/login" replace />;
};

export default KitchenProtectedRoute;