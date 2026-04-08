import React from "react";
import { Outlet } from "react-router-dom";
import KitchenNavbar from "../common/kitchenNavBar";
import KitchenLiveNotification from "../common/startPreparingNotification";

const KitchenLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">

      {/* 🔔 Global Kitchen Notification */}
      <KitchenLiveNotification />

      {/* Navbar */}
      <KitchenNavbar />

      {/* Page Content */}
      <div className="flex-1">
        <Outlet />
      </div>

    </div>
  );
};

export default KitchenLayout;