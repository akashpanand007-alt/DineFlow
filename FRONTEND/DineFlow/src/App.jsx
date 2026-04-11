import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react"; 
import socket from "./socket";

// Error Page
import Error404 from "./components/layout/error404Page";

// Customer Pages
import MenuPage from "./components/pages/Menu";
import CartPage from "./components/pages/cartPage";
import Checkout from "./components/pages/checkOut";
import VerifyOtp from "./components/pages/verifyOtp";
import Payment from "./components/pages/paymentPage";
import OrderSuccess from "./components/pages/orderSuccess";
import OrderFailed from "./components/pages/orderFail";
import TrackOrder from "./components/pages/trackOrder";

// Kitchen
import KitchenLogin from "./components/pages/kitchenLogin";
import KitchenDashboard from "./components/pages/kitchenDashboard";
import KitchenHistory from "./components/pages/kitchenHistory";
import KitchenSignup from "./components/pages/kitchenSignUp";
import KitchenWaitingApproval from "./components/pages/kitchenWaitingApproval";
import KitchenLayout from "./components/layout/kitchenLayout";
import KitchenForgotPassword from "./components/common/kitchenForgotPassword";
import KitchenResetPassword from "./components/common/kitchenResetPassword";


// Admin
import AdminLogin from "./components/pages/adminLoginPage";
import AdminDashboard from "./components/pages/adminDashboard";
import AdminOrders from "./components/pages/adminOrder";
import AdminKitchens from "./components/pages/adminKitchen";
import AdminProducts from "./components/pages/adminProduct";
import AdminTables from "./components/pages/adminTable";
import AdminEarnings from "./components/pages/adminEarnings";

// Common Components
import AdminLayout from "./components/layout/adminLayout"; 
import ForgotPassword from "./components/common/forgotPassword";

// Auth + Guards
import { AdminAuthProvider } from "./context/adminAuthContext";
import AdminProtectedRoute from "./routes/adminProtectedRoute";
import KitchenProtectedRoute from "./routes/kitchenProtectedRoute";
import { AdminOrderProvider } from "./context/adminOrderNotification";

function App() {
  // ✅ Global Socket Connection
  useEffect(() => {
  }, []);

  return (
    <AdminAuthProvider>
      <AdminOrderProvider>
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          {/* ===== CUSTOMER SIDE ===== */}
          <Route path="/order" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-failed" element={<OrderFailed />} />
          <Route path="/track-order" element={<TrackOrder />} />

          {/* ===== KITCHEN ===== */}
<Route path="/kitchen/login" element={<KitchenLogin />} />
<Route path="/kitchen/signup" element={<KitchenSignup />} />
<Route
  path="/kitchen/waiting-approval"
  element={<KitchenWaitingApproval />}
/>
<Route path="/kitchen/forgot-password" element={<KitchenForgotPassword />} />
<Route path="/kitchen/reset-password" element={<KitchenResetPassword />} />

<Route element={<KitchenProtectedRoute />}>
  <Route path="/kitchen" element={<KitchenLayout />}>
    <Route path="orders" element={<KitchenDashboard />} />
    <Route path="history" element={<KitchenHistory />} />
  </Route>
</Route>

          {/* ===== ADMIN PUBLIC ===== */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword role="admin" />} />

          {/* ===== ADMIN PROTECTED ===== */}
          <Route element={<AdminProtectedRoute />}>

           <Route element={<AdminLayout />}>

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/kitchens" element={<AdminKitchens />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/tables" element={<AdminTables />} />
            <Route path="/admin/earnings" element={<AdminEarnings />} />
          </Route>
          </Route>

          {/* ===== FALLBACK ===== */}
          <Route path="*" element={<Error404 />} />
        </Routes>
      </AdminOrderProvider>
    </AdminAuthProvider>
  );
}

export default App;

