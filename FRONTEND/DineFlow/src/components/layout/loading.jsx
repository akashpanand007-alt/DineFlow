import React from "react";

const COLORS = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
};

const LoadingPage = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* SVG Loader */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke={COLORS.primary}
            strokeWidth="8"
            fill="none"
            strokeDasharray="80 200"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 60 60"
              to="360 60 60"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Inner pulse */}
          <circle cx="60" cy="60" r="12" fill={COLORS.primary}>
            <animate
              attributeName="r"
              values="10;14;10"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>

        {/* Text */}
        <div className="text-center">
          <h2
            className="text-xl font-bold"
            style={{ color: COLORS.text }}
          >
            Loading Dashboard
          </h2>
          <p className="text-sm text-[#7C6B51] mt-1">
            Please wait…
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
