import React, { useState, useRef } from "react";
import { X, ImagePlus } from "lucide-react";
import API from "../../api/api";
import { Input, Textarea } from "./FormInputs";
import { COLORS } from "../../constants/theme";

const AddProductModal = ({ open, onClose, onCreated }) => {
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    dietType: "VEG",
    active: true,
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const openFilePicker = () => {
    fileRef.current?.click();
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      setError("Please fill out required fields (Name, Price, Category)");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("basePrice", form.price);
      formData.append("variants", JSON.stringify([]));
      formData.append("dietType", form.dietType);

      if (form.images?.length) {
        for (let file of form.images) {
          formData.append("images", file);
        }
      }

      const res = await API.post(
        "/admin/products/add",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const newProduct = res.data?.product;

      if (newProduct && onCreated) {
        onCreated({
          ...newProduct,
          price: newProduct.basePrice ?? newProduct.price ?? form.price,
        });
      }

      onClose();

      setForm({
        name: "",
        description: "",
        category: "",
        price: "",
        dietType: "VEG",
        active: true,
        images: [],
      });
    } catch (e) {
      console.error("Failed to add product:", e);
      setError(e.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-2 sm:p-4">
      <div className="w-full max-w-lg sm:max-w-2xl max-h-[95vh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#312B1E]">
            Add New Product
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4 sm:space-y-5">
          <Input
            label="Product Name *"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <Input
            label="Category *"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          />

          <Input
            label="Base Price *"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
          />

          {/* DIET TYPE */}
          <div>
            <label className="text-sm font-semibold text-[#312B1E]">
              Diet Type
            </label>

            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dietType"
                  value="VEG"
                  checked={form.dietType === "VEG"}
                  onChange={(e) =>
                    setForm({ ...form, dietType: e.target.value })
                  }
                />
                Veg
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dietType"
                  value="NON_VEG"
                  checked={form.dietType === "NON_VEG"}
                  onChange={(e) =>
                    setForm({ ...form, dietType: e.target.value })
                  }
                />
                Non-Veg
              </label>
            </div>
          </div>

          {/* CLICKABLE IMAGE UPLOAD */}
          <div>
            <label className="text-sm font-semibold text-[#312B1E]">
              Product Images
            </label>

            <div
              onClick={openFilePicker}
              className="mt-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#FC5C02] transition"
            >
              <ImagePlus
                size={28}
                className="mx-auto text-[#7C6B51]"
              />
              <p className="text-sm text-[#7C6B51] mt-2">
                Click to upload images
              </p>

              {form.images?.length > 0 && (
                <p className="text-xs text-[#7C6B51] mt-1 font-semibold text-[#FC5C02]">
                  {form.images.length} image(s) selected
                </p>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activeProduct"
              checked={form.active}
              onChange={(e) =>
                setForm({
                  ...form,
                  active: e.target.checked,
                })
              }
              className="cursor-pointer"
            />
            <label htmlFor="activeProduct" className="text-sm text-[#312B1E] cursor-pointer">
              Active Product
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6 sm:mt-8">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-200 text-[#312B1E] font-semibold cursor-pointer hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 rounded-lg text-white font-semibold cursor-pointer hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: COLORS.primary }}
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
