import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, Banknote, CheckCircle } from "lucide-react";
import API from "../../api/api";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderData || !orderData.orderId) {
      navigate("/");
    }
  }, [orderData, navigate]);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleConfirmPayment = async () => {
    if (!paymentMethod) return;

    setLoading(true);

    try {

      /**
       * PAY LATER
       */
      if (paymentMethod === "PAY_LATER") {

  await API.post("/orders/set-payment", {
    orderId: orderData.orderId,
    method: "PAY_LATER"
  });

  navigate("/order-success", {
    state: {
      orderData: {
        ...orderData,
        paymentMethod: "PAY_LATER"
      }
    }
  });

  return;
}

      /**
       * ONLINE PAYMENT
       */
      const sdkLoaded = await loadRazorpay();

      if (!sdkLoaded) {
        alert("Payment SDK failed to load");
        setLoading(false);
        return;
      }

      const { data } = await API.post("/payments/create-order", {
        orderId: orderData.orderId
      });

      const razorpayOrder = data.razorpayOrder;

      const options = {
        key: data.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "DineFlow",
        description: "Order Payment",
        order_id: razorpayOrder.id,

        handler: async function (response) {
          try {

            await API.post("/payments/verify-payment", {
              orderId: orderData.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            navigate("/order-success", {
              state: {
                orderData: {
                  ...orderData,
                  paymentMethod: "ONLINE"
                }
              }
            });

          } catch (err) {
          }
        },

        prefill: {
          name: orderData.customerName,
          email: orderData.customerEmail
        },

        theme: {
          color: "#FC5C02"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) return null;

  return (
    <div className="min-h-screen bg-[#E2CEAE] pb-24">

      <header className="flex items-center px-5 py-4">
        <ArrowLeft size={24} className="cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="ml-4 text-lg font-bold text-[#312B1E]">
          Select Payment Method
        </h2>
      </header>

      <div className="p-5 max-w-md mx-auto space-y-4">

        {/* ONLINE */}
        <div
          onClick={() => setPaymentMethod("ONLINE")}
          className={`cursor-pointer bg-white rounded-xl p-4 border-2 ${
            paymentMethod === "ONLINE"
              ? "border-[#FC5C02]"
              : "border-transparent"
          }`}
        >
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <CreditCard size={28} className="text-[#FC5C02]" />
              <div>
                <p className="font-bold text-[#312B1E]">Pay Online</p>
                <p className="text-sm text-[#7C6B51]">UPI / Card / Netbanking</p>
              </div>
            </div>
            {paymentMethod === "ONLINE" && (
              <CheckCircle size={22} className="text-[#FC5C02]" />
            )}
          </div>
        </div>

        {/* PAY LATER */}
        <div
          onClick={() => setPaymentMethod("PAY_LATER")}
          className={`cursor-pointer bg-white rounded-xl p-4 border-2 ${
            paymentMethod === "PAY_LATER"
              ? "border-[#FC5C02]"
              : "border-transparent"
          }`}
        >
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <Banknote size={28} className="text-[#FC5C02]" />
              <div>
                <p className="font-bold text-[#312B1E]">Pay at Counter</p>
                <p className="text-sm text-[#7C6B51]">Cash / Offline</p>
              </div>
            </div>
            {paymentMethod === "PAY_LATER" && (
              <CheckCircle size={22} className="text-[#FC5C02]" />
            )}
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white px-5 py-4 shadow flex justify-between">

        <div>
          <p className="text-sm text-[#7C6B51]">Total Amount</p>
          <p className="text-xl font-black text-[#312B1E]">
            ₹{orderData.grandTotal}
          </p>
        </div>

        <button
          disabled={!paymentMethod || loading}
          onClick={handleConfirmPayment}
          className="bg-[#FC5C02] text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? "Processing..." : "Confirm"}
        </button>

      </div>

    </div>
  );
};

export default Payment;

