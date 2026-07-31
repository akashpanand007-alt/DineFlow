import React from "react";
import { Plus, Minus } from "lucide-react";

const MenuCard = React.memo(({ item, qty, onAdd, onRemove }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* IMAGE */}
      {item.images?.[0] ? (
        <img
          src={item.images[0]}
          alt={item.name}
          className="h-36 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-36 bg-[#7C6B51]/20 flex items-center justify-center text-[#7C6B51] text-xs">
          No image available
        </div>
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

          {item.bestseller && (
            <span className="ml-auto bg-[#FC5C02] text-white text-[10px] px-2 py-0.5 rounded font-bold">
              BESTSELLER
            </span>
          )}
        </div>

        {/* NAME & DESCRIPTION */}
        <h3 className="text-lg font-semibold text-[#312B1E] mb-1">
          {item.name}
        </h3>
        <p className="text-sm text-[#7C6B51] mb-4 line-clamp-2">{item.desc}</p>

        {/* PRICE & ADD/REMOVE CONTROLS */}
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-[#312B1E]">₹{item.price}</span>

          {qty === 0 ? (
            <button
              onClick={() => onAdd(item.id)}
              className="border border-[#FC5C02] text-[#FC5C02] bg-[#F9F5F0] hover:bg-[#FC5C02] hover:text-white px-5 py-2 rounded-lg font-bold cursor-pointer transition-colors"
            >
              ADD +
            </button>
          ) : (
            <div className="flex items-center bg-[#FC5C02] rounded-lg overflow-hidden">
              <button
                onClick={() => onRemove(item.id)}
                className="p-2 text-white cursor-pointer hover:bg-orange-700 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="px-3 font-bold text-white text-sm">{qty}</span>
              <button
                onClick={() => onAdd(item.id)}
                className="p-2 text-white cursor-pointer hover:bg-orange-700 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MenuCard.displayName = "MenuCard";

export default MenuCard;
