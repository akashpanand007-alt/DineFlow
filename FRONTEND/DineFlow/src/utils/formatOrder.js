export const mapOrderStatus = (status, kitchenStatus) => {
  const s = (status || "").toUpperCase();
  const ks = (kitchenStatus || "").toUpperCase();

  if (s === "COMPLETED") return "completed";
  if (ks === "SERVED") return "served";
  if (ks === "READY") return "ready";
  if (s === "CANCELLED") return "cancelled";
  if (s === "REJECTED") return "rejected";
  if (s === "CONFIRMED") return "live";
  if (s === "OTP_PENDING" || s === "OTP_VERIFIED") return "pending";

  return "pending";
};

export const formatOrder = (o) => {
  if (!o) return null;
  
  let tableDisplay = "—";
  if (typeof o.tableId === "string") {
    tableDisplay = o.tableId;
  } else if (o.tableId?.number) {
    tableDisplay = o.tableId.number;
  } else if (o.table) {
    tableDisplay = o.table;
  }

  return {
    id: o._id || o.id,
    customer: o.customerName || "N/A",
    table: tableDisplay,
    amount: o.totalAmount ?? o.amount ?? 0,
    status: mapOrderStatus(o.orderStatus || o.status, o.kitchenStatus),
    rawStatus: o.orderStatus || o.status,
    kitchenStatus: o.kitchenStatus || "",
    paymentMethod: o.payment?.method || "—",
    paymentStatus: o.payment?.status || "PENDING",
    date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—",
    items: o.items || [],
    raw: o,
  };
};
