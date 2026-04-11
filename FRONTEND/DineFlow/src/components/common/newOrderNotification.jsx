import React, { useState, useEffect } from "react";
import { UtensilsCrossed } from "lucide-react";
import socket from "../../socket";
import API from "../../api/api";


const AdminOrderLive = () => {
  const [order, setOrder] = useState(null);
  const [tableName, setTableName] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    
    const joinAdminRoom = () => {
      if (socket.connected) {
        socket.emit("join_admin");
      }
    };

    
    joinAdminRoom();

    
    socket.on("connect", joinAdminRoom);

    
    const handleNewOrder = async (data) => {
      setTableName(null);
      setOrder(data);
      setIsVisible(true);

      
      if (data.tableId && data.tableId.number) {
        
        setTableName(data.tableId.number);
      } else {
        
        const tId = data.tableId?._id || data.tableId;

        if (tId) {
          if (typeof tId === 'string' && tId.length < 10) {
             setTableName(tId);
          } else {
            try {
              const res = await API.get(`/admin/tables/${tId}`);
              const table = res.data?.table || res.data;
              if (table?.number) {
                setTableName(table.number);
              }
            } catch (err) {
            }
          }
        }
      }
    };

    socket.on("new_order_alert", handleNewOrder);

    
    return () => {
      socket.off("connect", joinAdminRoom);
      socket.off("new_order_alert", handleNewOrder);
    };
  }, []);

  const handleAccept = async () => {
    if (!order) return;
    try {
      await API.post("/orders/approve", { orderId: order._id });
      setIsVisible(false);
      setTimeout(() => setOrder(null), 300);
    } catch (err) {
    }
  };

  const handleReject = async () => {
    if (!order) return;
    try {
      await API.post("orders/reject", { orderId: order._id });
      setIsVisible(false);
      setTimeout(() => setOrder(null), 300);
    } catch (err) {
    }
  };


  if (!order) return null;

  const amount = order.amount || order.totalAmount || 0;
  const items = order.items || [];

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-green-100 rounded-full">
            <UtensilsCrossed size={24} className="text-green-600" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-800">New Pay-at-Table Order</h2>
            <p className="text-sm text-gray-500">
              Table <span className="font-bold text-orange-600">{tableName || "..."}</span>
            </p>
          </div>
        </div>

        <div className="border-t border-b py-4 mb-4 space-y-2 max-h-48 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">No items</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.name} <span className="text-gray-400">×{item.quantity || 1}</span>
                </span>
                <span className="font-semibold text-gray-800">₹{item.price}</span>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="font-semibold text-gray-600">Total</span>
          <span className="text-xl font-bold text-[#FC5C02]">₹{amount}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 py-2 border border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Accept Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderLive;