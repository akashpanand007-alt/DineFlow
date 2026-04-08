import React from 'react';

const colors = {
  primary: "#FC5C02",
  bg: "#E2CEAE",
  text: "#312B1E",
  muted: "#7C6B51",
};

const Error404 = () => {
  return (
    <div style={{
      backgroundColor: colors.bg,
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <style>
          {`
            .four {
              font-size: 150px;
              font-family: Arial, sans-serif;
              fill: ${colors.primary};
              animation: slideIn 1s ease-out;
            }
            .zero {
              font-size: 150px;
              font-family: Arial, sans-serif;
              fill: ${colors.text};
              animation: bounce 2s infinite ease-in-out;
            }
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
              }
              40% {
                transform: translateY(-30px);
              }
              60% {
                transform: translateY(-15px);
              }
            }
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(-50px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            .left-four {
              animation-delay: 0s;
            }
            .right-four {
              animation: slideInRight 1s ease-out;
            }
            @keyframes slideInRight {
              from {
                opacity: 0;
                transform: translateX(50px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            .circle {
              fill: ${colors.muted};
              opacity: 0.5;
              animation: pulse 3s infinite;
            }
            @keyframes pulse {
              0% {
                transform: scale(1);
                opacity: 0.5;
              }
              50% {
                transform: scale(1.2);
                opacity: 0.2;
              }
              100% {
                transform: scale(1);
                opacity: 0.5;
              }
            }
          `}
        </style>
        <circle cx="200" cy="150" r="120" className="circle" />
  <text x="40" y="180" className="four left-four">4</text>
  <text x="160" y="180" className="zero">0</text>
  <text x="280" y="180" className="four right-four">4</text>
      </svg>
      <h1 style={{ color: colors.text, margin: '10px 0' }}>404 - Page Not Found</h1>
      <p style={{ color: colors.muted, fontSize: '18px' }}>The page you're looking for doesn't exist or has been moved.</p>
    </div>
  );
};

export default Error404;