import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  IndianRupee,
  Trash2,
  Menu,
} from "lucide-react";
import AdminSidebar from "../common/adminSideBar";
import API from "../../api/api";
import socket from "../../socket";
import AddProductModal from "../common/addProductModal"; // ✅ NEW

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const AdminProducts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState([]);

  const categories = [
    "all",
    ...Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ),
  ];

  // ================= FETCH =================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/admin/products");

        const normalized = (res.data?.products || []).map((p) => ({
          ...p,
          price: p.basePrice,
        }));

        setProducts(normalized);
      } catch (e) {
      }
    };
    fetchProducts();
  }, []);

  // ================= SOCKET =================
  useEffect(() => {
    socket.emit("join", { roomType: "admins" });

    socket.on("product_created", (p) => {
      setProducts((prev) => [
        { ...p, price: p.basePrice },
        ...prev,
      ]);
    });

    socket.on("product_updated", (p) => {
      setProducts((prev) =>
        prev.map((x) =>
          x._id === p._id ? { ...p, price: p.basePrice } : x
        )
      );
    });

    socket.on("product_deleted", (id) => {
      setProducts((prev) =>
        prev.filter((x) => x._id !== id)
      );
    });

    return () => {
      socket.off("product_created");
      socket.off("product_updated");
      socket.off("product_deleted");
    };
  }, []);

  // ================= FILTER =================
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      activeCategory === "all" || p.category === activeCategory;
    const matchSearch = p.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // ================= ACTIONS =================
  const handleDelete = async (id) => {
    try {
      setProducts((prev) =>
        prev.filter((p) => p._id !== id)
      );
      await API.delete(`/admin/products/delete/${id}`);
    } catch (e) {
    }
  };

  return (
    <div
      className="flex min-h-screen w-full"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} color={COLORS.text} />
          </button>
          <h1 className="font-bold text-lg">Products</h1>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-2xl bg-[#FC5C02]/10">
                <Package
                  size={24}
                  className="sm:w-[26px] sm:h-[26px]"
                  color={COLORS.primary}
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#312B1E]">
                  Product Management
                </h1>
                <p className="text-xs sm:text-sm text-[#7C6B51]">
                  Add, update pricing and manage categories
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-white font-semibold shadow-md hover:opacity-90"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition
                  ${
                    activeCategory === cat
                      ? "bg-[#FC5C02] text-white shadow"
                      : "bg-[#FC5C02]/10 text-[#312B1E]"
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative mb-6 sm:mb-8">
              <Search
                size={18}
                className="absolute left-4 top-3.5 text-[#7C6B51]"
              />
              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-[#FC5C02]/40"
              />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm min-w-[520px]">
                <thead className="bg-[#FC5C02]/5 text-[#7C6B51]">
                  <tr>
                    <th className="py-3 sm:py-4 px-4 text-left">
                      Product
                    </th>
                    <th className="px-4 text-left">
                      Category
                    </th>
                    <th className="px-4 text-center">
                      Price
                    </th>
                    <th className="px-4 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr
                      key={p._id}
                      className="border-t hover:bg-[#FC5C02]/5"
                    >
                      <td className="py-3 sm:py-4 px-4 font-semibold text-[#312B1E]">
                        {p.name}
                      </td>
                      <td className="px-4 text-[#7C6B51]">
                        {p.category}
                      </td>
                      <td className="px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <IndianRupee size={14} />
                          {p.price}
                        </div>
                      </td>
                      <td className="px-4">
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-semibold flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ✅ EXTRACTED MODAL */}
      <AddProductModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={(newProduct) =>
          setProducts((prev) => [newProduct, ...prev])
        }
      />
    </div>
  );
};

export default AdminProducts;
