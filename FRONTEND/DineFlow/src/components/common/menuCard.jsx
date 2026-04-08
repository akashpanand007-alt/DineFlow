import React from "react";
import { Plus, Minus } from "lucide-react";

function MenuCard({ item, qty, onAdd, onRemove }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">

      {/* IMAGE */}
      {item.images?.[0] ? (
        <img
          src={item.images[0]}
          alt={item.name}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="h-36 bg-[#7C6B51]/20" />
      )}

      <div className="p-4 flex flex-col flex-1">

        {/* VEG / NON-VEG Indicator + Optional Badge */}
        <div className="flex items-center mb-2">
          <div
            className={`w-4 h-4 border-2 mr-2 flex items-center justify-center ${
              item.type === "veg" ? "border-green-600" : "border-red-600"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                item.type === "veg" ? "bg-green-600" : "bg-red-600"
              }`}
            />
          </div>

          {item.id === 2 && (
            <span className="ml-auto bg-[#FC5C02] text-white text-[10px] px-2 py-0.5 rounded">
              BESTSELLER
            </span>
          )}
        </div>

        {/* NAME & DESCRIPTION */}
        <h3 className="text-lg font-semibold text-[#312B1E] mb-1">
          {item.name}
        </h3>
        <p className="text-sm text-[#7C6B51] mb-4">{item.desc}</p>

        {/* PRICE & ADD/REMOVE CONTROLS */}
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-[#312B1E]">₹{item.price}</span>

          {qty === 0 ? (
            <button
              onClick={() => onAdd(item.id)}
              className="border border-[#FC5C02] text-[#FC5C02] bg-[#F9F5F0] px-5 py-2 rounded-lg font-bold cursor-pointer"
            >
              ADD +
            </button>
          ) : (
            <div className="flex items-center bg-[#FC5C02] rounded-lg overflow-hidden">
              <button
                onClick={() => onRemove(item.id)}
                className="p-3 text-white cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <span className="px-3 font-bold text-white">{qty}</span>
              <button
                onClick={() => onAdd(item.id)}
                className="p-2 text-white cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MenuCard;

