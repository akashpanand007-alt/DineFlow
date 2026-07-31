import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  FileText,
  ChevronRight,
  Utensils,
} from "lucide-react";
import API from "../../api/api";
import { normalizeProductList } from "../../utils/normalizeProduct";

const CartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tableId = location.state?.tableId || null;
  const cart = location.state?.cart || {};
  const passedItems = location.state?.items || [];

  const [items, setItems] = useState(passedItems);
  const [instruction, setInstruction] = useState("");

  useEffect(() => {
    if (passedItems.length === 0) {
      API.get("/product/list")
        .then((res) => {
          const list =
            Array.isArray(res.data)
              ? res.data
              : res.data.products || res.data.data || [];

          const normalized = normalizeProductList(list);
          setItems(normalized);
        })
        .catch((err) => {
          console.error("Failed to fetch product list for cart:", err);
        });
    }
  }, [passedItems]);

  const initialCartItems = useMemo(() => {
    return Object.keys(cart)
      .map((id) => {
        const product = items.find((x) => x.id === id);
        return {
          id,
          qty: cart[id],
          ...product,
        };
      })
      .filter((p) => p.name);
  }, [cart, items]);

  const [cartItems, setCartItems] = useState(initialCartItems);

  useEffect(() => {
    setCartItems(initialCartItems);
  }, [initialCartItems]);

  const itemTotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.price || 0) * item.qty, 0),
    [cartItems]
  );
  
  const taxes = useMemo(() => Math.round(itemTotal * 0.05), [itemTotal]);
  const grandTotal = useMemo(() => itemTotal + taxes, [itemTotal, taxes]);

  const updateQty = useCallback((id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handlePlaceOrder = () => {
    navigate("/checkout", {
      state: {
        orderData: {
          tableId,
          cartItems,
          instruction,
          itemTotal,
          taxes,
          grandTotal,
        },
      },
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#E2CEAE] flex flex-col items-center justify-center">
        <Utensils size={64} className="text-[#7C6B51] opacity-50 mb-5" />
        <h2 className="text-[#312B1E] text-xl font-semibold">
          Your Cart is Empty
        </h2>
        <button
          onClick={() => navigate(`/order?tableId=${tableId || ""}`)}
          className="mt-5 bg-[#FC5C02] text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-orange-700 transition-colors"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E2CEAE] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#E2CEAE] border-b border-[#7C6B51] px-5 py-4 flex items-center">
        <ArrowLeft
          size={24}
          className="text-[#312B1E] cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <span className="ml-4 text-lg font-bold text-[#312B1E]">
          Order Summary
        </span>
      </header>

      <div className="p-5 max-w-lg mx-auto">
        {/* Cart Items */}
        <div className="mb-5 space-y-3">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center flex-1">
                <div
                  className={`w-3.5 h-3.5 border-2 ${
                    item.type === "veg"
                      ? "border-green-600"
                      : "border-red-600"
                  } flex items-center justify-center mr-3`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.type === "veg"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  />
                </div>

                <div>
                  <p className="font-semibold text-[#312B1E]">
                    {item.name}
                  </p>
                  <p className="text-sm text-[#7C6B51]">
                    ₹{item.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#7C6B51]/40 rounded-md bg-[#F9F5F0]">
                  <button
                    className="px-3 py-1 font-bold cursor-pointer text-[#312B1E]"
                    onClick={() => updateQty(item.id, -1)}
                  >
                    -
                  </button>
                  <span className="px-2 font-bold text-[#312B1E]">
                    {item.qty}
                  </span>
                  <button
                    className="px-3 py-1 font-bold cursor-pointer text-[#312B1E]"
                    onClick={() => updateQty(item.id, 1)}
                  >
                    +
                  </button>
                </div>

                <Trash2
                  size={18}
                  className="text-[#e74c3c] opacity-70 hover:opacity-100 cursor-pointer transition-opacity"
                  onClick={() => removeItem(item.id)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mb-5">
          <div className="flex items-center mb-2 text-[#7C6B51]">
            <FileText size={18} className="mr-2" />
            <span className="text-sm font-medium">
              Cooking Instructions
            </span>
          </div>

          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g., Less spicy, no coriander..."
            className="w-full p-3 rounded-lg bg-[#F9F5F0] border border-[#7C6B51]/60 text-sm outline-none focus:ring-2 focus:ring-[#FC5C02]"
          />
        </div>

        {/* Bill */}
        <div className="bg-white rounded-xl p-5 space-y-3 shadow-sm text-[#312B1E]">
          <div className="flex justify-between">
            <span>Item Total</span>
            <span>₹{itemTotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes & Charges (5%)</span>
            <span>₹{taxes}</span>
          </div>
          <div className="flex justify-between text-xl font-black border-t pt-3">
            <span>To Pay</span>
            <span className="text-[#FC5C02]">
              ₹{grandTotal}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-5 py-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex justify-between items-center z-10 max-w-lg mx-auto">
        <div>
          <p className="text-[#7C6B51] text-sm">
            Total Payable
          </p>
          <p className="text-2xl font-black text-[#312B1E]">
            ₹{grandTotal}
          </p>
        </div>

        <button
          onClick={handlePlaceOrder}
          className="bg-[#FC5C02] hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-colors"
        >
          Proceed <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default CartPage;
