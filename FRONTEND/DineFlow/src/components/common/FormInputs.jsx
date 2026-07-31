import React from "react";

export const Input = React.memo(({ label, error, className = "", ...props }) => (
  <div>
    {label && <label className="text-sm font-semibold text-[#312B1E]">{label}</label>}
    <input
      {...props}
      className={`w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FC5C02]/40 ${className}`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
));

Input.displayName = "Input";

export const Textarea = React.memo(({ label, error, className = "", rows = 3, ...props }) => (
  <div>
    {label && <label className="text-sm font-semibold text-[#312B1E]">{label}</label>}
    <textarea
      rows={rows}
      {...props}
      className={`w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FC5C02]/40 ${className}`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
));

Textarea.displayName = "Textarea";
