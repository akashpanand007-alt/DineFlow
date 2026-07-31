import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Layouts & Loaders
import LoadingPage from "./components/layout/loading";
import AdminLayout from "./components/layout/adminLayout";
import KitchenLayout from "./components/layout/kitchenLayout";

// Error Page
const Error404 = lazy(() => import("./components/layout/error404Page"));

// Customer Pages
const MenuPage = lazy(() => import("./components/pages/Menu"));
const CartPage = lazy(() => import("./components/pages/cartPage"));
const Checkout = lazy(() => import("./components/pages/checkOut"));
const VerifyOtp = lazy(() => import("./components/pages/verifyOtp"));
const Payment = lazy(() => import("./components/pages/paymentPage"));
const OrderSuccess = lazy(() => import("./components/pages/orderSuccess"));
const OrderFailed = lazy(() => import("./components/pages/orderFail"));
const TrackOrder = lazy(() => import("./components/pages/trackOrder"));

// Kitchen Pages
const KitchenLogin = lazy(() => import("./components/pages/kitchenLogin"));
const KitchenDashboard = lazy(() => import("./components/pages/kitchenDashboard"));
const KitchenHistory = lazy(() => import("./components/pages/kitchenHistory"));
const KitchenSignup = lazy(() => import("./components/pages/kitchenSignUp"));
const KitchenWaitingApproval = lazy(() => import("./components/pages/kitchenWaitingApproval"));
const KitchenForgotPassword = lazy(() => import("./components/common/kitchenForgotPassword"));
const KitchenResetPassword = lazy(() => import("./components/common/kitchenResetPassword"));

// Admin Pages
const AdminLogin = lazy(() => import("./components/pages/adminLoginPage"));
const AdminDashboard = lazy(() => import("./components/pages/adminDashboard"));
const AdminOrders = lazy(() => import("./components/pages/adminOrder"));
const AdminKitchens = lazy(() => import("./components/pages/adminKitchen"));
const AdminProducts = lazy(() => import("./components/pages/adminProduct"));
const AdminTables = lazy(() => import("./components/pages/adminTable"));
const AdminEarnings = lazy(() => import("./components/pages/adminEarnings"));
const ForgotPassword = lazy(() => import("./components/common/forgotPassword"));

// Auth + Guards
import { AdminAuthProvider } from "./context/adminAuthContext";
import AdminProtectedRoute from "./routes/adminProtectedRoute";
import KitchenProtectedRoute from "./routes/kitchenProtectedRoute";
import { AdminOrderProvider } from "./context/adminOrderNotification";

function App() {
  return (
    <AdminAuthProvider>
      <AdminOrderProvider>
        <Toaster position="top-right" reverseOrder={false} />

        <Suspense fallback={<LoadingPage />}>
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

            {/* ===== KITCHEN PUBLIC ===== */}
            <Route path="/kitchen/login" element={<KitchenLogin />} />
            <Route path="/kitchen/signup" element={<KitchenSignup />} />
            <Route path="/kitchen/waiting-approval" element={<KitchenWaitingApproval />} />
            <Route path="/kitchen/forgot-password" element={<KitchenForgotPassword />} />
            <Route path="/kitchen/reset-password" element={<KitchenResetPassword />} />

            {/* ===== KITCHEN PROTECTED ===== */}
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
        </Suspense>
      </AdminOrderProvider>
    </AdminAuthProvider>
  );
}

export default App;
