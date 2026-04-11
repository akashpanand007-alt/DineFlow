import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/adminAuthContext.jsx";

export default function AdminProtectedRoute() {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  
  if (loading) return null; 

  
  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  
  return <Outlet />;
}