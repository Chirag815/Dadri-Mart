import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { AlertCircle } from "lucide-react";

export default function AuthPortal() {
  const { handleLogin, handleRegister, selectedAddress } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [roleSelection, setRoleSelection] = useState("user");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (isLogin) {
      const res = await handleLogin(username, password, roleSelection);
      if (!res?.success) {
        setErrorMsg("Invalid username or password. Please try again.");
      }
    } else {
      if (!username || !email || !password || !fullname) {
        setErrorMsg("All fields are required");
        return;
      }
      const res = await handleRegister(username, email, password, fullname, roleSelection);
      if (res?.success) {
        setIsLogin(true);
        setErrorMsg("Registration successful! Please login.");
      } else {
        setErrorMsg("Registration failed. Try a different username/email.");
      }
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 glass-panel p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden bg-gradient-violet-radial">
      <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl"></div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          {isLogin ? "Your instant groceries are only 10 minutes away" : "Sign up for premium grocery logistics"}
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold mb-6 animate-slide-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm"
              placeholder="Alex Carter"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full glass-input px-4 py-3 rounded-xl text-sm"
            placeholder="alex_carter"
          />
        </div>

        {!isLogin && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm"
              placeholder="alex@gmail.com"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full glass-input px-4 py-3 rounded-xl text-sm"
            placeholder="••••••••"
          />
        </div>

        {/* Role Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Portal Role</label>
          <div className="grid grid-cols-3 gap-2 bg-gray-900/60 p-1.5 rounded-xl border border-gray-800">
            {["user", "admin", "rider"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleSelection(r)}
                className={`py-2 rounded-lg text-xs font-bold uppercase transition-all capitalize cursor-pointer ${
                  roleSelection === r
                    ? "bg-violet-500 text-white shadow-md shadow-violet-500/20"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {r === "user" ? "Customer" : r === "admin" ? "Store Admin" : "Rider"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-violet-600/30 cursor-pointer text-sm mt-6 uppercase tracking-wider"
        >
          {isLogin ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
        >
          {isLogin ? "Need a new account? Register here" : "Already have an account? Sign In"}
        </button>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-4 text-center">
        <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
          💡 Review Tip: You can enter any username and password to simulate instantaneous login! Use the simulation deck at the bottom to test multiple roles.
        </p>
      </div>
    </div>
  );
}
