import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { AlertCircle, ShieldAlert, Smartphone, KeyRound } from "lucide-react";

export default function AdminLogin() {
  const { requestOtp, verifyOtp } = useContext(AppContext);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!phone) {
      setErrorMsg("Admin phone number is required");
      return;
    }

    const res = await requestOtp(phone);
    if (res.success) {
      setOtpSent(true);
      setSuccessMsg(`OTP generated: ${res.otp}`);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    const res = await verifyOtp(phone, otp, "admin"); // logs in with admin superuser role context
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-16 glass-panel p-6 md:p-8 rounded-3xl border border-red-500/20 shadow-2xl relative bg-gradient-violet-radial">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-bold text-red-400 uppercase tracking-wider mb-4 animate-pulse">
          <ShieldAlert className="w-4 h-4" />
          <span>System Controller Portal</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Admin Gate Entry</h2>
        <p className="text-xs text-gray-500 mt-2">Manage service areas, store timings, analytics, and accounts.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold mb-6 animate-slide-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold mb-6 animate-slide-in">
          <Smartphone className="w-4 h-4 shrink-0 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
          <div className="relative">
            <Smartphone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
            <input
              type="tel"
              required
              disabled={otpSent}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
              placeholder="Admin Phone"
            />
          </div>
        </div>

        {otpSent && (
          <div className="animate-slide-in">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Enter 4-Digit OTP</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                maxLength="4"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm text-center font-black tracking-widest"
                placeholder="0000"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-red-600/30 cursor-pointer text-sm mt-6 uppercase tracking-wider"
        >
          {otpSent ? "Verify & Log In" : "Request Admin OTP"}
        </button>
      </form>
    </div>
  );
}
