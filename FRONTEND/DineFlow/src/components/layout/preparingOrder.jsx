import React from "react";

/**
 * Attractive Order Loading Page
 * Restaurant / food themed SVG animation
 * Fully responsive
 */

export default function OrderLoadingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#FFF6ED] via-[#FFE8D6] to-[#FFD7B8]">
      <div className="flex flex-col items-center gap-8 px-6">
        {/* Plate + Spinner */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56">
          {/* Plate */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-xl"
          >
            <defs>
              <radialGradient id="plateGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f3f3f3" />
              </radialGradient>
            </defs>

            {/* outer plate */}
            <circle cx="100" cy="100" r="90" fill="url(#plateGrad)" />

            {/* rim */}
            <circle
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke="#FC5C02"
              strokeWidth="4"
              strokeDasharray="6 8"
              className="animate-spin-slow"
              style={{ transformOrigin: "center" }}
            />

            {/* center food */}
            <circle cx="100" cy="100" r="36" fill="#FC5C02" opacity="0.9" />
          </svg>

          {/* rotating fork */}
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDuration: "3s" }}
          >
            <g transform="translate(100 25)">
              <rect x="-3" y="0" width="6" height="60" rx="3" fill="#312B1E" />
              <rect x="-10" y="0" width="3" height="20" fill="#312B1E" />
              <rect x="-3" y="0" width="3" height="20" fill="#312B1E" />
              <rect x="4" y="0" width="3" height="20" fill="#312B1E" />
              <rect x="11" y="0" width="3" height="20" fill="#312B1E" />
            </g>
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-[#312B1E]">
            Preparing your order…
          </h2>
          <p className="text-sm text-[#7C6B51] mt-2">
            Our kitchen is cooking something delicious 🍽️
          </p>
        </div>

        {/* progress dots */}
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FC5C02] animate-bounce" />
          <span
            className="w-3 h-3 rounded-full bg-[#FC5C02] animate-bounce"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="w-3 h-3 rounded-full bg-[#FC5C02] animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>

      {/* custom slow spin */}
      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}