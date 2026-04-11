import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Lock, RefreshCcw } from "lucide-react";
import API from "../../api/api";

const OTP_LENGTH = 6;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const orderData = location.state?.orderData;

  const email = orderData?.customerEmail;
  const orderId = orderData?.orderId || orderData?._id;
  const paymentMethod = orderData?.paymentMethod;

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email || !orderId) {
      navigate("/");
    }
  }, [email, orderId, navigate]);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // 🔹 reusable OTP request
  const requestOtp = async () => {
  try {
    setError("");
    setSendingOtp(true); // 🔥 start animation

    await API.post("/otp/request", { email, orderId });

    setOtpSent(true);
    setTimer(30);

  } catch (err) {
    setError("Failed to send OTP");
  } finally {
    setSendingOtp(false); // stop loading
  }
};

  // 🔹 send OTP automatically when page loads
  

  const handleVerifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError("Enter valid OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await API.post("/otp/verify", {
        email,
        otp,
        orderId,
      });

      /**
       * PAY LATER FLOW
       */
      navigate("/payment", {
        state: {
          orderId,
          orderData,
          email,
          amount: orderData?.grandTotal
        }
      });

    } catch (err) {

      setError(
        err.response?.data?.message || "Invalid OTP"
      );

    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setOtp("");
      setError("");

      await requestOtp();

    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  if (!email || !orderId) return null;

  return (
    <div className="min-h-screen bg-[#E2CEAE] flex flex-col">

      <header className="flex items-center px-5 py-4">
        <ArrowLeft
          size={24}
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />

        <h2 className="ml-4 text-lg font-bold text-[#312B1E]">
          Verify OTP
        </h2>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6">

        <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center">

          <Lock size={40} className="mx-auto text-[#FC5C02] mb-3" />

          <h3 className="font-bold text-lg text-[#312B1E] mb-1">
            OTP Verification
          </h3>

          <p className="text-sm text-[#7C6B51] mb-1">
            OTP sent to
          </p>

          <p className="font-semibold text-[#312B1E]">
            {email}
          </p>

          <p className="text-xs text-[#7C6B51] mb-4">
            Order ID: <span className="font-semibold">{orderId}</span>
          </p>

          

          {!otpSent ? (
  <button
  onClick={requestOtp}
  disabled={sendingOtp || otpSent}
  className={`mt-6 w-full py-3 rounded-xl font-bold transition-all duration-300 ${
    otpSent
      ? "bg-green-500 text-white"
      : sendingOtp
      ? "bg-orange-400 text-white"
      : "bg-[#FC5C02] text-white"
  }`}
>
  {sendingOtp
    ? "Sending OTP..."
    : otpSent
    ? "OTP Sent ✓"
    : "Send OTP"}
</button>
) : (
  <>
    <input
      type="tel"
      maxLength={OTP_LENGTH}
      value={otp}
      onChange={(e) =>
        setOtp(e.target.value.replace(/\D/g, ""))
      }
      className="w-full text-center text-2xl tracking-widest py-3 border border-[#7C6B51]/50 rounded-xl outline-none mb-2"
    />

    {error && (
      <p className="text-sm text-red-500 mt-1">
        {error}
      </p>
    )}

    <div className="mt-3 text-sm text-[#7C6B51]">
      {timer > 0 ? (
        <>Resend OTP in <b>{timer}s</b></>
      ) : (
        <button
          onClick={requestOtp}
          className="flex items-center justify-center gap-2 text-[#FC5C02] font-bold"
        >
          <RefreshCcw size={16} /> Resend OTP
        </button>
      )}
    </div>

    <button
      onClick={handleVerifyOtp}
      className="mt-6 w-full bg-[#FC5C02] text-white py-3 rounded-xl font-bold"
    >
      Verify & Continue
    </button>
  </>
)}

        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;
