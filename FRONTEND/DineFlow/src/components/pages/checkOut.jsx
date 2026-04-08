import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Mail } from "lucide-react";
import API from "../../api/api";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = { name: "", email: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
    ) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    const tableId = orderData?.tableId || orderData?.table?._id;

    if (!tableId) {
      alert("Table not detected. Please scan table QR again.");
      return;
    }

    try {
      setLoading(true);

      const backendOrder = {
        tableId,
        customerName: name,
        customerEmail: email,
        items: orderData.cartItems.map((i) => ({
          productId: i.productId || i.id,
          name: i.name,
          quantity: i.qty,
          price: i.price,
        })),
        totalAmount: orderData.grandTotal,
        payment: {method: "null"}, // default until payment page
      };
      const orderRes = await API.post("/orders/create", backendOrder);

      const createdOrder = orderRes.data?.order;

      navigate("/verify-otp", {
        state: {
          orderData: {
            ...orderData,
            orderId: createdOrder._id,
            customerName: name,
            customerEmail: email,
          },
        },
      });

    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E2CEAE] flex flex-col">

      <header className="flex items-center px-5 py-4">
        <ArrowLeft
          size={24}
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h2 className="ml-4 text-lg font-bold text-[#312B1E]">
          Customer Details
        </h2>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6">

        <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-[#7C6B51]">
              Name
            </label>

            <div className="flex items-center border rounded-xl px-3 mt-1 bg-[#F9F5F0]">
              <User size={18} className="text-[#7C6B51]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-transparent p-3 outline-none"
              />
            </div>

            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-[#7C6B51]">
              Email
            </label>

            <div className="flex items-center border rounded-xl px-3 mt-1 bg-[#F9F5F0]">
              <Mail size={18} className="text-[#7C6B51]" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent p-3 outline-none"
              />
            </div>

            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full bg-[#FC5C02] text-white py-3 rounded-xl font-bold mt-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? "Loading..." : "Continue"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default Checkout;


