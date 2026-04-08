import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Utensils, MapPin } from "lucide-react";
import API from "../../api/api";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ support both navigation shapes
  const orderId =
    location.state?.orderId ||
    location.state?.orderData?.orderId;

  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    API.get(`/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data?.order);
      })
      .catch((err) => {
      });
  }, [orderId, navigate]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E2CEAE]">
        <p className="text-[#312B1E]">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E2CEAE] flex flex-col items-center justify-center px-6 text-center">
      <div className="animate-success">
        <CheckCircle size={90} className="text-green-600 mx-auto mb-4" />
      </div>

      <h1 className="text-2xl font-black text-[#312B1E] mb-2">
        Order Placed Successfully!
      </h1>

      <p className="text-[#7C6B51] mb-6">
        Your order has been sent to the kitchen.
        <br />
        Please relax while we prepare it 🍽️
      </p>

      <div className="bg-white rounded-xl p-5 w-full max-w-sm mb-6">
        <div className="flex justify-between mb-2">
          <span>Total Amount</span>
          <span className="font-bold">₹{order.totalAmount}</span>
        </div>

        <div className="flex justify-between text-sm text-[#7C6B51]">
          <span>Payment Method</span>
          <span>{order.payment?.method || "-"}</span>
        </div>

        <div className="flex justify-between text-sm text-[#7C6B51]">
          <span>Order ID</span>
          <span className="font-semibold">{order._id}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={() =>
            navigate("/track-order", {
              state: { orderId: order._id },
            })
          }
          className="bg-[#007BFF] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <MapPin size={18} /> Track Order
        </button>

        <button
  onClick={() => navigate(`/order?tableId=${order?.tableId?._id}`)}
  className="bg-[#FC5C02] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
>
  <Utensils size={18} /> Back to Menu
</button>
      </div>

      <style>{`
        .animate-success {
          animation: pop 0.6s ease-out;
        }

        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;

