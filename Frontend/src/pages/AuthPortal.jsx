import React, { useState, useContext } from "react";
import { AppContext, ADDR_OPTIONS } from "../context/AppContext";
import { AlertCircle, Smartphone, KeyRound, User, Mail, MapPin } from "lucide-react";

export default function AuthPortal() {
  const { requestOtp, verifyOtp, handleRegister, selectedAddress } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  
  // Registration states
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressText, setAddressText] = useState("");
  const [pincode, setPincode] = useState("");
  const [roleSelection, setRoleSelection] = useState("user"); // user (Customer) or admin (Vendor/Store Admin)

  // Login states
  const [loginPhone, setLoginPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRequestOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!loginPhone) {
      setErrorMsg("Phone number is required");
      return;
    }

    const res = await requestOtp(loginPhone);
    if (res.success) {
      setOtpSent(true);
      setDemoOtp(res.otp);
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!loginOtp) {
      setErrorMsg("OTP verification code is required");
      return;
    }

    const res = await verifyOtp(loginPhone, loginOtp, roleSelection);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullname || !email || !phone || !pincode || !addressText) {
      setErrorMsg("All registration fields are required");
      return;
    }

    const res = await handleRegister(fullname, email, phone, addressText, pincode, roleSelection);
    if (res.success) {
      setIsLogin(true);
      setLoginPhone(phone);
      setSuccessMsg("Registration successful! Please click 'Request OTP' to log in.");
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 glass-panel p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden bg-gradient-violet-radial">
      <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl"></div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">
          {isLogin ? "Passwordless Login" : "Create Account"}
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          {isLogin ? "Access your quick groceries securely via OTP" : "Sign up for 10-minute grocery delivery"}
        </p>
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

      {isLogin ? (
        // ================= LOGIN FORM =================
        <form onSubmit={otpSent ? handleVerifyOtpSubmit : handleRequestOtpSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
            <div className="relative">
              <Smartphone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="tel"
                required
                disabled={otpSent}
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                placeholder="Enter 10-digit number"
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
                  value={loginOtp}
                  onChange={(e) => setLoginOtp(e.target.value)}
                  className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm text-center font-black tracking-widest"
                  placeholder="0000"
                />
              </div>
            </div>
          )}

          {/* Role selector for login view (Customer vs Vendor only — Admin is hidden) */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">I am a</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-900/60 p-1.5 rounded-xl border border-gray-800">
              {[
                { key: "user", label: "Customer" },
                { key: "vendor", label: "Vendor" }
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRoleSelection(r.key)}
                  className={`py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    roleSelection === r.key
                      ? "bg-violet-500 text-white shadow-md shadow-violet-500/20"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-violet-600/30 cursor-pointer text-sm mt-6 uppercase tracking-wider"
          >
            {otpSent ? "Verify & Log In" : "Request Login OTP"}
          </button>

          {otpSent && (
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setLoginOtp("");
              }}
              className="w-full text-center text-xs font-semibold text-gray-500 hover:text-white transition-colors py-1.5"
            >
              Change Phone Number
            </button>
          )}
        </form>
      ) : (
        // ================= REGISTRATION FORM =================
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                placeholder="Alex Carter"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                placeholder="alex@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
            <div className="relative">
              <Smartphone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                placeholder="10-Digit Phone"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Delivery Address Text</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                  placeholder="Street name, floor, landmark"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Area Pincode</label>
              <input
                type="text"
                required
                maxLength="6"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                placeholder="110001"
              />
            </div>
          </div>

          {/* Role selector for signup (Customer or Vendor — Admin registers manually) */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Register As</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-900/60 p-1.5 rounded-xl border border-gray-800">
              {[
                { key: "user", label: "Customer" },
                { key: "vendor", label: "Vendor" }
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRoleSelection(r.key)}
                  className={`py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    roleSelection === r.key
                      ? "bg-violet-500 text-white shadow-md shadow-violet-500/20"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-violet-600/30 cursor-pointer text-sm mt-6 uppercase tracking-wider"
          >
            Create Account
          </button>
        </form>
      )}

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setErrorMsg("");
            setSuccessMsg("");
            setOtpSent(false);
          }}
          className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
        >
          {isLogin ? "Need a new account? Register here" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}
