import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { XCircle, RefreshCcw } from "lucide-react";
import API from "../../api/api";   // ✅ added

const OrderFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const orderData = location.state?.orderData;

  // ✅ notify backend that payment failed
  useEffect(() => {
    if (!orderData?.orderId) return;

    API.post("/payments/fail", {
      orderId: orderData.orderId,
    }).catch(() => {
      // ignore failure — UI still shows
    });
  }, [orderData]);

  return (
    <div className="min-h-screen bg-[#E2CEAE] flex flex-col items-center justify-center px-6 text-center">
      <div className="animate-shake">
        <XCircle size={90} className="text-red-600 mx-auto mb-4" />
      </div>

      <h1 className="text-2xl font-black text-[#312B1E] mb-2">
        Payment Failed
      </h1>

      <p className="text-[#7C6B51] mb-6">
        Something went wrong while processing your payment.<br />
        Don’t worry, no amount was deducted.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() =>
            navigate("/payment", {
              state: { orderData },
            })
          }
          className="bg-[#FC5C02] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
        >
          <RefreshCcw size={18} /> Try Again
        </button>

        <button
          onClick={() => navigate("/")}
          className="bg-white text-[#312B1E] px-6 py-3 rounded-xl font-bold cursor-pointer"
        >
          Go Home
        </button>
      </div>

      <style>{`
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-6px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default OrderFailed;

