import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import AddProductModal from "../common/addProductModal";
import { COLORS } from "../../constants/theme";

const AdminProducts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/admin/products");

        const normalized = (res.data?.products || []).map((p) => ({
          ...p,
          price: p.basePrice ?? p.price ?? 0,
        }));

        setProducts(normalized);
      } catch (e) {
        console.error("Failed to fetch products:", e);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    socket.emit("join", { roomType: "admins" });

    const handleCreated = (p) => {
      setProducts((prev) => [
        { ...p, price: p.basePrice ?? p.price ?? 0 },
        ...prev,
      ]);
    };

    const handleUpdated = (p) => {
      setProducts((prev) =>
        prev.map((x) =>
          x._id === p._id ? { ...p, price: p.basePrice ?? p.price ?? 0 } : x
        )
      );
    };

    const handleDeleted = (id) => {
      setProducts((prev) => prev.filter((x) => x._id !== id));
    };

    socket.on("product_created", handleCreated);
    socket.on("product_updated", handleUpdated);
    socket.on("product_deleted", handleDeleted);

    return () => {
      socket.off("product_created", handleCreated);
      socket.off("product_updated", handleUpdated);
      socket.off("product_deleted", handleDeleted);
    };
  }, []);

  const categories = useMemo(() => {
    return [
      "all",
      ...Array.from(
        new Set(products.map((p) => p.category).filter(Boolean))
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchLower = search.toLowerCase();
    return products.filter((p) => {
      const matchCategory =
        activeCategory === "all" || p.category === activeCategory;
      const matchSearch = p.name
        ?.toLowerCase()
        .includes(searchLower);
      return matchCategory && matchSearch;
    });
  }, [products, activeCategory, search]);

  const handleDelete = useCallback(async (id) => {
    try {
      setProducts((prev) => prev.filter((p) => p._id !== id));
      await API.delete(`/admin/products/delete/${id}`);
    } catch (e) {
      console.error("Failed to delete product:", e);
    }
  }, []);

  const handleProductCreated = useCallback((newProduct) => {
    setProducts((prev) => [
      { ...newProduct, price: newProduct.basePrice ?? newProduct.price ?? 0 },
      ...prev,
    ]);
  }, []);

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
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-white font-semibold shadow-md hover:opacity-90 cursor-pointer transition-opacity"
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
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer
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
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FC5C02]/40"
              />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm min-w-[520px]">
                <thead className="bg-[#FC5C02]/5 text-[#7C6B51]">
                  <tr>
                    <th className="py-3 sm:py-4 px-4 text-left">Product</th>
                    <th className="px-4 text-left">Category</th>
                    <th className="px-4 text-center">Price</th>
                    <th className="px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-[#7C6B51]">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
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
                            className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-semibold flex items-center gap-1 cursor-pointer hover:bg-red-200"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <AddProductModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleProductCreated}
      />
    </div>
  );
};

export default AdminProducts;
