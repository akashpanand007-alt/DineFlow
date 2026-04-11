import React, { useState, useEffect } from "react";
import {
  Utensils,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  Menu,
  Trash2,
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
      }
    };

    fetchKitchens();
  }, []);

 
  useEffect(() => {
    socket.emit("join", { roomType: "admins" });

    socket.on("kitchen_created", (k) => {
      setKitchens((prev) => [k, ...prev]);
    });

    socket.on("kitchen_updated", (k) => {
      setKitchens((prev) =>
        prev.map((x) => (x._id === k._id ? k : x))
      );
    });

    socket.on("kitchen_deleted", (id) => {
      setKitchens((prev) =>
        prev.filter((x) => x._id !== id)
      );
    });

    return () => {
      socket.off("kitchen_created");
      socket.off("kitchen_updated");
      socket.off("kitchen_deleted");
    };
  }, []);

  const approveKitchen = async (id) => {
    try {
      await API.post("/admin/kitchens/approve", {
        kitchenId: id,
      });
    } catch (e) {
    }
  };

  const rejectKitchen = async (id) => {
    try {
      await API.post("/admin/kitchens/reject", {
        kitchenId: id,
      });
    } catch (e) {
    }
  };

  const deactivateKitchen = async (id) => {
    try {
      await API.patch("/admin/kitchens/deactivate", {
        kitchenId: id,
      });
    } catch (e) {
    }
  };


  const reactivateKitchen = async (id) => {
    try {
      await API.patch("/admin/kitchens/reactivate", {
        kitchenId: id,
      });
    } catch (e) {
    }
  };

  const deleteKitchen = async (id) => {
    try {
      await API.delete(`/admin/kitchens/${id}`);
    } catch (e) {
    }
  };


  const filteredKitchens = kitchens.filter((kitchen) => {
    const matchesStatus =
      activeFilter === "all" ||
      kitchen.status === activeFilter;

    const matchesSearch =
      kitchen.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      kitchen.owner
        ?.toLowerCase()
        .includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

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
              <Utensils
                size={26}
                color={COLORS.primary}
              />
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
                  onClick={() =>
                    setActiveFilter(status)
                  }
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
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
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-[#FC5C02]/40"
              />
            </div>

            {/* TABLE */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-[#FC5C02]/5 text-[#7C6B51]">
                  <tr>
                    <th className="py-4 px-4 text-left">
                      Kitchen
                    </th>
                    <th className="px-4 text-left">
                      Owner
                    </th>
                    <th className="px-4 text-left">
                      Status
                    </th>
                    <th className="px-4 text-left">
                      Joined
                    </th>
                    <th className="px-4 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKitchens.map(
                    (kitchen) => (
                      <tr
                        key={kitchen._id}
                        className="border-t hover:bg-[#FC5C02]/5"
                      >
                        <td className="py-4 px-4 font-semibold text-[#312B1E]">
                          {kitchen.name}
                        </td>
                        <td className="px-4">
                          {kitchen.owner}
                        </td>
                        <td className="px-4">
                          <StatusBadge
                            status={kitchen.status}
                          />
                        </td>
                        <td className="px-4 text-[#7C6B51]">
                          {new Date(
                            kitchen.createdAt
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-4">
                          <ActionButtons
                            status={kitchen.status}
                            onApprove={() =>
                              approveKitchen(
                                kitchen._id
                              )
                            }
                            onReject={() =>
                              rejectKitchen(
                                kitchen._id
                              )
                            }
                            onDeactivate={() =>
                              deactivateKitchen(
                                kitchen._id
                              )
                            }
                            onReactivate={() =>
                              reactivateKitchen(
                                kitchen._id
                              )
                            }
                            onDelete={() =>
                              deleteKitchen(
                                kitchen._id
                              )
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-5">
              {filteredKitchens.map(
                (kitchen) => (
                  <div
                    key={kitchen._id}
                    className="bg-white rounded-2xl p-5 shadow-md"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-[#312B1E]">
                        {kitchen.name}
                      </span>
                      <StatusBadge
                        status={kitchen.status}
                      />
                    </div>

                    <p className="text-sm text-[#7C6B51]">
                      Owner:{" "}
                      <b className="text-[#312B1E]">
                        {kitchen.owner}
                      </b>
                    </p>

                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(
                        kitchen.createdAt
                      ).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2 mt-4 flex-wrap">
                      <ActionButtons
                        status={kitchen.status}
                        onApprove={() =>
                          approveKitchen(
                            kitchen._id
                          )
                        }
                        onReject={() =>
                          rejectKitchen(
                            kitchen._id
                          )
                        }
                        onDeactivate={() =>
                          deactivateKitchen(
                            kitchen._id
                          )
                        }
                        onReactivate={() =>
                          reactivateKitchen(
                            kitchen._id
                          )
                        }
                        onDelete={() =>
                          deleteKitchen(
                            kitchen._id
                          )
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* STATUS BADGE */
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    deactivated: "bg-gray-200 text-gray-700",
  };

  const icons = {
    pending: <Clock size={14} />,
    approved: <CheckCircle2 size={14} />,
    rejected: <XCircle size={14} />,
    deactivated: <Ban size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-semibold ${styles[status]}`}
    >
      {icons[status]}
      {status}
    </span>
  );
};

/* ACTION BUTTONS */
const ActionButtons = ({
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
          className="px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 font-semibold"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-semibold"
        >
          Reject
        </button>
      </>
    )}

    {status === "approved" && (
      <>
        <button
          onClick={onDeactivate}
          className="px-3 py-1 text-xs rounded-lg bg-gray-200 text-gray-700 font-semibold"
        >
          Deactivate
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-semibold flex items-center gap-1"
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
          className="px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 font-semibold"
        >
          Reactivate
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-semibold flex items-center gap-1"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </>
    )}

    {status === "rejected" && (
      <button
        onClick={onDelete}
        className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 font-semibold flex items-center gap-1"
      >
        <Trash2 size={12} />
        Delete
      </button>
    )}
  </div>
);

export default AdminKitchens;


