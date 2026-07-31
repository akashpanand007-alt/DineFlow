import React from "react";
import { Clock, CheckCircle2, XCircle, Ban } from "lucide-react";

const STYLES = {
  pending: "bg-gray-100 text-gray-700",
  live: "bg-yellow-100 text-yellow-700",
  ready: "bg-blue-100 text-blue-700",
  served: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  approved: "bg-green-100 text-green-700",
  deactivated: "bg-gray-200 text-gray-700",
  Available: "bg-green-100 text-green-700",
  Occupied: "bg-red-100 text-red-700",
  settled: "bg-green-100 text-green-700",
};

const ICONS = {
  pending: <Clock size={14} />,
  live: <Clock size={14} />,
  ready: <Clock size={14} />,
  served: <CheckCircle2 size={14} />,
  completed: <CheckCircle2 size={14} />,
  cancelled: <XCircle size={14} />,
  rejected: <XCircle size={14} />,
  approved: <CheckCircle2 size={14} />,
  deactivated: <Ban size={14} />,
  Available: <CheckCircle2 size={14} />,
  Occupied: <XCircle size={14} />,
  settled: <CheckCircle2 size={14} />,
};

const StatusBadge = React.memo(({ status }) => {
  const normalized = status ? String(status).toLowerCase() : "";
  const style = STYLES[status] || STYLES[normalized] || "bg-gray-100 text-gray-700";
  const icon = ICONS[status] || ICONS[normalized] || null;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-semibold capitalize ${style}`}>
      {icon}
      {status}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

export default StatusBadge;
