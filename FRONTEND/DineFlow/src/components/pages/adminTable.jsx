import React, { useState, useEffect } from "react";
import {
  Table2,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Menu,
  X,
  Users,
} from "lucide-react";
import AdminSidebar from "../common/adminSideBar";
import API from "../../api/api";
import socket from "../../socket";

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const AdminTables = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [tables, setTables] = useState([]);
  const [qrPreview, setQrPreview] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await API.get("/admin/tables");
        setTables(res.data?.tables || []);
      } catch (e) {
      }
    };
    fetchTables();
  }, []);

  useEffect(() => {
    socket.emit("join", { roomType: "admins" });
    socket.on("table_created", (t) => setTables((prev) => [t, ...prev]));
    socket.on("table_updated", (t) => setTables((prev) => prev.map((x) => (x._id === t._id ? t : x))));
    socket.on("table_deleted", (id) => setTables((prev) => prev.filter((x) => x._id !== id)));
    socket.on("table_map_update", (t) => {
      setTables((prev) => {
        const exists = prev.find((x) => x._id === t._id);
        if (exists) return prev.map((x) => (x._id === t._id ? t : x));
        return [t, ...prev];
      });
    });
    return () => {
      socket.off("table_created");
      socket.off("table_updated");
      socket.off("table_deleted");
      socket.off("table_map_update");
    };
  }, []);

  const toggleStatus = async (table) => {
    try {
      const newStatus = table.status === "Available" ? "Occupied" : "Available";
      setTables((prev) => prev.map((x) => (x._id === table._id ? { ...x, status: newStatus } : x)));
      await API.patch("/admin/tables/toggle", { tableId: table._id, status: newStatus });
    } catch (e) {
    }
  };

  const deleteTable = async (id) => {
    try {
      await API.delete(`/admin/tables/${id}`);
    } catch (e) {
    }
  };

  const addTable = async (number, capacity) => {
    try {
      const res = await API.post("/admin/tables", { number, capacity });
      const newTable = res.data?.table;
      if (!newTable) return;
      setTables((prev) => [newTable, ...prev]);
    } catch (e) {
    }
  };

  const filteredTables = tables.filter((t) => {
    const matchFilter = filter === "all" || t.status === filter;
    const matchSearch = t.number?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: COLORS.bg }}>
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} color={COLORS.text} />
          </button>
          <h1 className="font-bold text-lg">Tables</h1>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-2xl bg-[#FC5C02]/10">
                <Table2 size={26} color={COLORS.primary} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#312B1E]">Table Management</h1>
                <p className="text-xs sm:text-sm text-[#7C6B51]">Manage restaurant tables & occupancy</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-white font-semibold shadow-md hover:opacity-90"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Plus size={16} />
              Add Table
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              {["all", "Available", "Occupied"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition ${
                    filter === s ? "bg-[#FC5C02] text-white shadow" : "bg-[#FC5C02]/10 text-[#312B1E]"
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative mb-6 sm:mb-8">
              <Search size={18} className="absolute left-4 top-3.5 text-[#7C6B51]" />
              <input
                type="text"
                placeholder="Search table number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FC5C02]/40"
              />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm min-w-[620px]">
                <thead className="bg-[#FC5C02]/5 text-[#7C6B51]">
                  <tr>
                    <th className="py-3 px-4 text-left">Table</th>
                    <th className="px-4 text-center">Capacity</th>
                    <th className="px-4 text-left">Status</th>
                    <th className="px-4 text-center">QR</th>
                    <th className="px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTables.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-[#7C6B51]">No tables found</td>
                    </tr>
                  ) : (
                    filteredTables.map((t) => (
                      <tr key={t._id} className="border-t hover:bg-[#FC5C02]/5">
                        <td className="py-3 px-4 font-semibold text-[#312B1E]">{t.number}</td>
                        <td className="px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-[#7C6B51]">
                            <Users size={14} />
                            {t.capacity}
                          </div>
                        </td>
                        <td className="px-4"><StatusBadge status={t.status} /></td>
                        <td className="px-4 text-center">
                          {t.qrCodeUrl ? (
                            <button onClick={() => setQrPreview(t.qrCodeUrl)} className="px-2 py-1 text-xs rounded-lg bg-purple-100 text-purple-700 font-semibold">View QR</button>
                          ) : (
                            <span className="text-xs text-gray-400">No QR</span>
                          )}
                        </td>
                        <td className="px-4">
                          <div className="flex gap-2">
                            <button onClick={() => toggleStatus(t)} className="px-3 py-1 text-xs rounded-lg bg-blue-100 text-blue-700 font-semibold">Toggle</button>
                            <button onClick={() => deleteTable(t._id)} className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-semibold flex items-center gap-1">
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
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

      {qrPreview && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center">
            <h3 className="font-bold text-lg mb-4 text-[#312B1E]">Table QR Code</h3>
            <img src={qrPreview} alt="Table QR" className="mx-auto w-48 h-48 object-contain border rounded-lg" />
            <div className="flex justify-center gap-3 mt-5">
              <a href={qrPreview} download="table-qr.png" className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold">Download</a>
              <button onClick={() => setQrPreview(null)} className="px-4 py-2 rounded-lg bg-gray-200 text-[#312B1E]">Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && <AddTableModal onClose={() => setShowAddModal(false)} onAdd={addTable} />}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = { Available: "bg-green-100 text-green-700", Occupied: "bg-red-100 text-red-700" };
  const icons = { Available: <CheckCircle2 size={14} />, Occupied: <XCircle size={14} /> };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-semibold ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
};

const AddTableModal = ({ onClose, onAdd }) => {
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#312B1E]">Add Table</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <Input label="Table Number" value={number} onChange={(e) => setNumber(e.target.value)} />
          <Input label="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-[#312B1E]">Cancel</button>
          <button onClick={() => { if (!number) return; onAdd(number, capacity); onClose(); }} className="px-5 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: "#FC5C02" }}>Add</button>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-semibold text-[#312B1E]">{label}</label>
    <input {...props} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200" />
  </div>
);

export default AdminTables;