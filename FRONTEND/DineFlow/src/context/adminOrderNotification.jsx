import { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket";

const AdminOrderContext = createContext();

export const useAdminOrders = () => useContext(AdminOrderContext);

export const AdminOrderProvider = ({ children }) => {
  const [incomingOrder, setIncomingOrder] = useState(null);

  useEffect(() => {
    
    socket.emit("join", { roomType: "admins" });

    socket.on("new_order_alert", (order) => {
      setIncomingOrder(order);
    });

    return () => {
      socket.off("new_order_alert");
    };
  }, []);

  return (
    <AdminOrderContext.Provider value={{ incomingOrder, setIncomingOrder }}>
      {children}
    </AdminOrderContext.Provider>
  );
};