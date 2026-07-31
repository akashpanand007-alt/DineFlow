import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Utensils,
  Search,
  Menu,
  Trash2,
} from "lucide-react";
import AdminSidebar from "../common/adminSideBar";
import API from "../../api/api";
import socket from "../../socket";
import StatusBadge from "../common/StatusBadge";
import { COLORS } from "../../constants/theme";

const AdminKitchens = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [kitchens, setKitchens] = useState([]);

  useEffect(() => {
    const fetchKitchens = async () => {
      try {
        const res = await API.get("/admin/kitchens");
        setKitchens(res.data?.kitchens || []);
      } catch (e) {
        console.error("Failed to fetch kitchens:", e);
      }
    };

    fetchKitchens();
  }, []);

  useEffect(() => {
    socket.emit("join", { roomType: "admins" });

    const handleCreated = (k) => setKitchens((prev) => [k, ...prev]);
    const handleUpdated = (k) => setKitchens((prev) => prev.map((x) => (x._id === k._id ? k : x)));
    const handleDeleted = (id) => setKitchens((prev) => prev.filter((x) => x._id !== id));

    socket.on("kitchen_created", handleCreated);
    socket.on("kitchen_updated", handleUpdated);
    socket.on("kitchen_deleted", handleDeleted);

    return () => {
      socket.off("kitchen_created", handleCreated);
      socket.off("kitchen_updated", handleUpdated);
      socket.off("kitchen_deleted", handleDeleted);
    };
  }, []);

  const approveKitchen = useCallback(async (id) => {
    try {
      await API.post("/admin/kitchens/approve", { kitchenId: id });
    } catch (e) {
      console.error("Failed to approve kitchen:", e);
    }
  }, []);

  const rejectKitchen = useCallback(async (id) => {
    try {
      await API.post("/admin/kitchens/reject", { kitchenId: id });
    } catch (e) {
      console.error("Failed to reject kitchen:", e);
    }
  }, []);

  const deactivateKitchen = useCallback(async (id) => {
    try {
      await API.patch("/admin/kitchens/deactivate", { kitchenId: id });
    } catch (e) {
      console.error("Failed to deactivate kitchen:", e);
    }
  }, []);

  const reactivateKitchen = useCallback(async (id) => {
    try {
      await API.patch("/admin/kitchens/reactivate", { kitchenId: id });
    } catch (e) {
      console.error("Failed to reactivate kitchen:", e);
    }
  }, []);

  const deleteKitchen = useCallback(async (id) => {
    try {
      await API.delete(`/admin/kitchens/${id}`);
    } catch (e) {
      console.error("Failed to delete kitchen:", e);
    }
  }, []);

  const filteredKitchens = useMemo(() => {
    const searchLower = search.toLowerCase();
    return kitchens.filter((kitchen) => {
      const matchesStatus =
        activeFilter === "all" || kitchen.status === activeFilter;

      const matchesSearch =
        kitchen.name?.toLowerCase().includes(searchLower) ||
        kitchen.owner?.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [kitchens, activeFilter, search]);

  return (
    <div
      className="flex min-h-screen w-full"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 min-w-0 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} color={COLORS.text} />
          </button>
          <h1 className="font-bold text-lg">Kitchens</h1>
        </div>

        <div className="space-y-8">
          {/* HEADER */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FC5C02]/10">
              <Utensils size={26} color={COLORS.primary} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#312B1E]">
                Kitchen Management
              </h1>
              <p className="text-sm text-[#7C6B51]">
                Approve, reject or manage kitchens
              </p>
            </div>
          </div>

          {/* FILTER + SEARCH */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg">
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                "all",
                "pending",
                "approved",
                "rejected",
                "deactivated",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer
                    ${
                      activeFilter === status
                        ? "bg-[#FC5C02] text-white shadow-md"
                        : "bg-[#FC5C02]/10 text-[#312B1E] hover:bg-[#FC5C02]/20"
                    }`}
                >
                  {status.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative mb-8">
              <Search
                size={18}
                className="absolute left-4 top-3.5 text-[#7C6B51]"
              />
              <input
                type="text"
                placeholder="Search kitchen or owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FC5C02]/40"
              />
            </div>

            {/* TABLE */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-[#FC5C02]/5 text-[#7C6B51]">
                  <tr>
                    <th className="py-4 px-4 text-left">Kitchen</th>
                    <th className="px-4 text-left">Owner</th>
                    <th className="px-4 text-left">Status</th>
                    <th className="px-4 text-left">Joined</th>
                    <th className="px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKitchens.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-[#7C6B51]">
                        No kitchens found
                      </td>
                    </tr>
                  ) : (
                    filteredKitchens.map((kitchen) => (
                      <tr
                        key={kitchen._id}
                        className="border-t hover:bg-[#FC5C02]/5"
                      >
                        <td className="py-4 px-4 font-semibold text-[#312B1E]">
                          {kitchen.name}
                        </td>
                        <td className="px-4">{kitchen.owner}</td>
                        <td className="px-4">
                          <StatusBadge status={kitchen.status} />
                        </td>
                        <td className="px-4 text-[#7C6B51]">
                          {kitchen.createdAt ? new Date(kitchen.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4">
                          <ActionButtons
                            status={kitchen.status}
                            onApprove={() => approveKitchen(kitchen._id)}
                            onReject={() => rejectKitchen(kitchen._id)}
                            onDeactivate={() => deactivateKitchen(kitchen._id)}
                            onReactivate={() => reactivateKitchen(kitchen._id)}
                            onDelete={() => deleteKitchen(kitchen._id)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-5">
              {filteredKitchens.map((kitchen) => (
                <div
                  key={kitchen._id}
                  className="bg-white rounded-2xl p-5 shadow-md"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-[#312B1E]">
                      {kitchen.name}
                    </span>
                    <StatusBadge status={kitchen.status} />
                  </div>

                  <p className="text-sm text-[#7C6B51]">
                    Owner: <b className="text-[#312B1E]">{kitchen.owner}</b>
                  </p>

                  <p className="text-xs text-gray-400 mt-3">
                    {kitchen.createdAt ? new Date(kitchen.createdAt).toLocaleDateString() : "—"}
                  </p>

                  <div className="flex gap-2 mt-4 flex-wrap">
                    <ActionButtons
                      status={kitchen.status}
                      onApprove={() => approveKitchen(kitchen._id)}
                      onReject={() => rejectKitchen(kitchen._id)}
                      onDeactivate={() => deactivateKitchen(kitchen._id)}
                      onReactivate={() => reactivateKitchen(kitchen._id)}
                      onDelete={() => deleteKitchen(kitchen._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ACTION BUTTONS */
const ActionButtons = React.memo(({
  status,
  onApprove,
  onReject,
  onDeactivate,
  onReactivate,
  onDelete,
}) => (
  <div className="flex items-center gap-2 flex-wrap">
    {status === "pending" && (
      <>
        <button
          onClick={onApprove}
          className="px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 font-semibold cursor-pointer hover:bg-green-200"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-semibold cursor-pointer hover:bg-red-200"
        >
          Reject
        </button>
      </>
    )}

    {status === "approved" && (
      <>
        <button
          onClick={onDeactivate}
          className="px-3 py-1 text-xs rounded-lg bg-gray-200 text-gray-700 font-semibold cursor-pointer hover:bg-gray-300"
        >
          Deactivate
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-semibold flex items-center gap-1 cursor-pointer hover:bg-red-200"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </>
    )}

    {status === "deactivated" && (
      <>
        <button
          onClick={onReactivate}
          className="px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 font-semibold cursor-pointer hover:bg-green-200"
        >
          Reactivate
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-semibold flex items-center gap-1 cursor-pointer hover:bg-red-200"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </>
    )}

    {status === "rejected" && (
      <button
        onClick={onDelete}
        className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-semibold flex items-center gap-1 cursor-pointer hover:bg-red-200"
      >
        <Trash2 size={12} />
        Delete
      </button>
    )}
  </div>
));
ActionButtons.displayName = "ActionButtons";

export default AdminKitchens;
