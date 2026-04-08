import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";

import API from "../../api/api";

const KitchenHistory = () => {
  const navigate = useNavigate();
  const [historyOrders, setHistoryOrders] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/orders/kitchen/history");
        setHistoryOrders(res.data?.orders || []);
      } catch (e) {
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#E2CEAE]">

      <div className="p-5">
        {historyOrders.length === 0 && (
          <p className="text-[#7C6B51]">
            No completed orders yet
          </p>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {historyOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-4 shadow-md"
            >
              <p className="font-bold text-[#312B1E] mb-1">
                #{order.id}
              </p>

              <p className="text-sm text-[#7C6B51] mb-2">
                Table {order.table}
              </p>

              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm text-[#312B1E]"
                >
                  <span>{item.name}</span>
                  <span className="font-bold">
                    × {item.qty ?? item.quantity}
                  </span>
                </div>
              ))}

              <div className="flex items-center gap-1 text-xs text-[#7C6B51] mt-3">
                <Clock size={12} /> Completed
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KitchenHistory;



