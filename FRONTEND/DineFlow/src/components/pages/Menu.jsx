import React, { useState, useMemo, useEffect, useCallback } from "react";
import { ShoppingCart, Search, ChevronRight } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MenuCard from "../common/menuCard";
import API from "../../api/api";
import { normalizeProductList } from "../../utils/normalizeProduct";

export default function MenuPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const tableId =
    location.state?.tableId ||
    new URLSearchParams(location.search).get("tableId");

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState("");
  const [tableName, setTableName] = useState(null);

  const [activeOrder, setActiveOrder] = useState(null);

  // Fetch Table Info
  useEffect(() => {
    if (!tableId) return;

    API.get(`/admin/tables/${tableId}`)
      .then((res) => {
        const table = res.data?.table || res.data;
        if (table?.number) setTableName(table.number);
      })
      .catch((err) => {
        console.error("Failed to fetch table details:", err);
      });
  }, [tableId]);

  // Fetch Products
  useEffect(() => {
    API.get("/product/list")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data.products || res.data.data || [];

        const normalized = normalizeProductList(list);
        setItems(normalized);

        const backendCats = [
          "All",
          ...Array.from(new Set(normalized.map((p) => p.category))).filter(
            Boolean
          ),
        ];
        setCategories(backendCats);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch Active Order for Table
  useEffect(() => {
    if (!tableId) return;

    API.get("/orders")
      .then((res) => {
        const orders = res.data?.orders || [];

        const latest = orders.find((o) => {
          const orderTableId =
            typeof o.tableId === "object" ? o.tableId._id : o.tableId;

          return (
            String(orderTableId) === String(tableId) &&
            !["COMPLETED", "CANCELLED", "REJECTED"].includes(o.orderStatus)
          );
        });

        if (latest) setActiveOrder(latest);
      })
      .catch((err) => {
        console.error("Failed to fetch active orders:", err);
      });
  }, [tableId]);

  const handleAdd = useCallback((id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  const handleRemove = useCallback((id) => {
    setCart((prev) => {
      const qty = (prev[id] || 0) - 1;
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: qty };
    });
  }, []);

  const filteredItems = useMemo(() => {
    const searchLower = search.toLowerCase();
    const catLower = activeCategory.toLowerCase();

    return items.filter((item) => {
      const matchCategory =
        activeCategory === "All" ||
        item.category?.toLowerCase() === catLower;

      const matchSearch = item.name
        ?.toLowerCase()
        .includes(searchLower);

      return matchCategory && matchSearch;
    });
  }, [items, activeCategory, search]);

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return Object.keys(cart).reduce((total, id) => {
      const item = items.find((i) => i.id === id);
      return total + (item?.price || 0) * cart[id];
    }, 0);
  }, [cart, items]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E2CEAE] animate-pulse">
        {/* HEADER SKELETON */}
        <div className="bg-[#312B1E] p-5 space-y-4">
          <div className="h-5 w-32 bg-[#7C6B51] rounded"></div>
          <div className="h-10 w-full bg-[#7C6B51] rounded-lg"></div>
        </div>

        {/* CATEGORY SKELETON */}
        <div className="flex gap-3 px-5 py-4 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-20 bg-[#7C6B51] rounded-full flex-shrink-0"
            />
          ))}
        </div>

        {/* GRID SKELETON */}
        <div className="grid gap-5 px-5 pb-10 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 space-y-4 shadow"
            >
              <div className="h-32 bg-gray-300 rounded-lg"></div>

              <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
              <div className="h-3 w-1/2 bg-gray-300 rounded"></div>

              <div className="flex justify-between items-center mt-3">
                <div className="h-4 w-16 bg-gray-300 rounded"></div>
                <div className="h-8 w-20 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E2CEAE] pb-24 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-[#312B1E] p-5 text-[#E2CEAE]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">
              Dine<span className="text-[#FC5C02]">Flow</span>
            </h1>
            <p className="text-xs text-[#7C6B51]">
              {tableName ? `Table ${tableName}` : "Table"} • Guest View
            </p>
          </div>

          <div className="relative">
            <Link
              to="/cart"
              state={{
                cart,
                items,
                totalItems,
                totalPrice,
                tableId,
              }}
            >
              <ShoppingCart className="cursor-pointer text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FC5C02] text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-[#7C6B51]" />
          <input
            type="text"
            placeholder="Search for dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-[#F9F5F0] px-10 py-3 text-[#312B1E] outline-none focus:ring-2 focus:ring-[#FC5C02]"
          />
        </div>
      </header>

      {/* CATEGORIES */}
      <div className="flex gap-3 overflow-x-auto px-5 py-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold border transition cursor-pointer
              ${
                activeCategory === cat
                  ? "bg-[#FC5C02] text-white border-[#FC5C02]"
                  : "bg-transparent text-[#312B1E] border-[#7C6B51]"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* MENU GRID */}
      <div className="grid gap-5 px-5 pb-10 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            qty={cart[item.id] || 0}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* STICKY TRACK ORDER BAR */}
      {activeOrder && (
        <div
          onClick={() =>
            navigate("/track-order", {
              state: {
                orderId: activeOrder._id,
                orderData: activeOrder,
              },
            })
          }
          className="fixed bottom-[90px] left-1/2 -translate-x-1/2 w-[92%] max-w-md 
                     bg-gradient-to-r from-[#FC5C02] to-[#ff7a2f]
                     text-white rounded-2xl px-5 py-4 shadow-2xl 
                     flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              🍽️
            </div>

            <div>
              <p className="text-xs opacity-80">
                Order #{activeOrder._id.slice(-6)}
              </p>
              <p className="font-bold leading-tight">
                {activeOrder.orderStatus === "PLACED" && "Order placed"}
                {activeOrder.orderStatus === "PREPARING" &&
                  "Preparing your food"}
                {activeOrder.orderStatus === "READY" && "Ready for serving"}
                {activeOrder.orderStatus === "SERVED" && "Served"}
              </p>
            </div>
          </div>

          <div className="flex items-center font-bold">
            Track <ChevronRight size={20} />
          </div>
        </div>
      )}

      {/* FLOATING CART */}
      {totalItems > 0 && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#312B1E] text-white rounded-xl px-5 py-4 shadow-2xl flex items-center justify-between cursor-pointer hover:bg-[#3d3626] transition-colors"
          onClick={() =>
            navigate("/cart", {
              state: { cart, items, totalItems, totalPrice, tableId },
            })
          }
        >
          <div>
            <p className="text-xs text-[#E2CEAE]">{totalItems} Items</p>
            <p className="text-lg font-bold">₹{totalPrice}</p>
          </div>
          <div className="flex items-center font-bold">
            View Cart <ChevronRight size={20} className="ml-1" />
          </div>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="col-span-full text-center text-[#312B1E] py-10">
          No products found
        </div>
      )}
    </div>
  );
}
