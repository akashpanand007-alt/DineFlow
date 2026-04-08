import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import socket from "../../socket";

import AdminOrderLive from "../common/newOrderNotification";
import AdminServeNotification from "../common/adminServeNotification";

export default function AdminLayout() {

  useEffect(() => {
    socket.emit("join_admin");
  }, []);

  return (
    <>
      <AdminOrderLive />
      <AdminServeNotification />
      <Outlet />
    </>
  );
}