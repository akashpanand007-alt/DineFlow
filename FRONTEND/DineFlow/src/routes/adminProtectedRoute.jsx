import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/adminAuthContext.jsx";

export default function AdminProtectedRoute() {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  // Wait until auth check completes
  if (loading) return null; // or loader component

  // Not authenticated → redirect to login
  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // Authenticated → render admin routes
  return <Outlet />;
}