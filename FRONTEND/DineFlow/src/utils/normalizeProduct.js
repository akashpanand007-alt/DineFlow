const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const normalizeProduct = (p) => {
  if (!p) return null;
  return {
    id: p._id || p.id,
    name: p.name || "",
    price: p.basePrice ?? p.price ?? 0,
    category: p.category || "",
    desc: p.description || "",
    type: p.dietType === "NON_VEG" ? "non-veg" : "veg",
    images: (p.images || [])
      .map((img) => {
        const raw =
          typeof img === "string"
            ? img
            : img?.url || img?.path || img?.src || "";

        if (!raw) return "";

        return raw.startsWith("http")
          ? raw
          : `${API_BASE_URL}/${raw.replace(/^\/+/, "")}`;
      })
      .filter(Boolean),
    raw: p,
  };
};

export const normalizeProductList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeProduct).filter(Boolean);
};
