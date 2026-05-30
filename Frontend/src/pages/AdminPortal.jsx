import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import StoreAnalyticsPage from "./StoreAnalyticsPage";
import UserManagementPage from "./UserManagementPage";
import api from "../lib/api";
import { Compass, CheckCircle, Search, Settings, Shield, Users, Plus, Trash2, ShieldAlert } from "lucide-react";

export default function AdminPortal() {
  const { orders, offlineMode, storeTimings, setStoreTimings } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("analytics"); // analytics, pincodes, timings, orders, users
  
  // Analytics State
  const [analytics, setAnalytics] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });

  // Pincode States
  const [pincodes, setPincodes] = useState([]);
  const [newPincode, setNewPincode] = useState("");

  // Timing states
  const [openTime, setOpenTime] = useState(storeTimings.storeOpenTime);
  const [closeTime, setCloseTime] = useState(storeTimings.storeCloseTime);

  useEffect(() => {
    fetchAnalytics();
    fetchPincodes();
    setOpenTime(storeTimings.storeOpenTime);
    setCloseTime(storeTimings.storeCloseTime);
  }, [storeTimings, orders]);

  const fetchAnalytics = async () => {
    if (offlineMode) {
      // Offline calculation from orders list
      const now = new Date();
      const todayStr = now.toDateString();
      const todayOrdersList = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
      
      const revenue = todayOrdersList.filter(o => o.status !== "CANCELLED").reduce((sum, o) => sum + o.total, 0);
      const pending = orders.filter(o => ["PLACED", "ACCEPTED", "PACKING", "READY_FOR_DELIVERY"].includes(o.status)).length;
      const delivered = orders.filter(o => ["DELIVERED", "PAYMENT_RECEIVED"].includes(o.status)).length;
      
      setAnalytics({
        todayOrders: todayOrdersList.length,
        todayRevenue: revenue,
        pendingOrders: pending,
        deliveredOrders: delivered
      });
      return;
    }

    try {
      const response = await api.get("/admin/analytics");
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.warn("Analytics fetch failed.");
    }
  };

  const fetchPincodes = async () => {
    if (offlineMode) {
      // Local mock seed
      if (pincodes.length === 0) {
        setPincodes([
          { _id: "pin1", code: "110001", isActive: true },
          { _id: "pin2", code: "110017", isActive: true },
          { _id: "pin3", code: "110008", isActive: true }
        ]);
      }
      return;
    }

    try {
      const response = await api.get("/admin/service-areas");
      if (response.data.success) {
        setPincodes(response.data.data);
      }
    } catch (error) {
      console.warn("Pincodes fetch failed.");
    }
  };

  const handleAddPincode = async (e) => {
    e.preventDefault();
    if (!newPincode) return;

    if (offlineMode) {
      const newPin = { _id: `pin_${Date.now()}`, code: newPincode.trim(), isActive: true };
      setPincodes(prev => [...prev, newPin]);
      setNewPincode("");
      alert("Pincode added successfully!");
      return;
    }

    try {
      const response = await api.post("/admin/service-areas", { code: newPincode });
      if (response.data.success) {
        setPincodes(prev => [...prev, response.data.data]);
        setNewPincode("");
        alert("Pincode added successfully!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add pincode");
    }
  };

  const handleRemovePincode = async (id) => {
    if (offlineMode) {
      setPincodes(prev => prev.filter(p => p._id !== id));
      alert("Pincode removed!");
      return;
    }

    try {
      const response = await api.delete(`/admin/service-areas/${id}`);
      if (response.data.success) {
        setPincodes(prev => prev.filter(p => p._id !== id));
        alert("Pincode removed!");
      }
    } catch (error) {
      alert("Failed to remove pincode");
    }
  };

  const handleSaveTimings = async (e) => {
    e.preventDefault();
    if (offlineMode) {
      setStoreTimings({ storeOpenTime: openTime, storeCloseTime: closeTime });
      alert("Store timings configured successfully!");
      return;
    }

    try {
      const response = await api.put("/admin/settings", {
        storeOpenTime: openTime,
        storeCloseTime: closeTime
      });
      if (response.data.success) {
        setStoreTimings(response.data.data);
        alert("Store timings configured successfully!");
      }
    } catch (error) {
      alert("Failed to update store timings");
    }
  };

  return (
    <div className="space-y-6 text-left animate-slide-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-red-500" />
            <span>Master System Settings</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Superuser controls for service areas, operating hours, and financials</p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 bg-gray-900/60 p-1 rounded-xl border border-gray-800 shrink-0">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Dashboard Analytics
          </button>
          <button
            onClick={() => setActiveTab("pincodes")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === "pincodes"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Service areas
          </button>
          <button
            onClick={() => setActiveTab("timings")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === "timings"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Operating Timings
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Manage Users
          </button>
        </div>
      </div>

      {/* ================= ANALYTICS TAB ================= */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-gray-800 text-left">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Today's Orders</span>
              <p className="text-3xl font-black text-white mt-1">{analytics.todayOrders}</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-gray-800 text-left">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Today's Revenue</span>
              <p className="text-3xl font-black text-emerald-400 mt-1">₹{analytics.todayRevenue}</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-gray-800 text-left">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pending Orders</span>
              <p className="text-3xl font-black text-amber-400 mt-1">{analytics.pendingOrders}</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-gray-800 text-left">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Delivered Orders</span>
              <p className="text-3xl font-black text-emerald-400 mt-1">{analytics.deliveredOrders}</p>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-3xl border border-gray-800">
            <h4 className="font-extrabold text-white text-base">System Configuration Overview</h4>
            <p className="text-xs text-gray-400 mt-1">
              Active operating hours: <strong className="text-white">{storeTimings.storeOpenTime}</strong> to <strong className="text-white">{storeTimings.storeCloseTime}</strong>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supported Area Pincodes: <strong className="text-white">{pincodes.length}</strong> service pincodes allowed.
            </p>
          </div>
        </div>
      )}

      {/* ================= PINCODES TAB ================= */}
      {activeTab === "pincodes" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="font-extrabold text-white text-base">Add Service Area Pincode</h3>
            <form onSubmit={handleAddPincode} className="space-y-3">
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit Pincode"
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value)}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
              />
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black py-2.5 rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save Pincode</span>
              </button>
            </form>
          </div>

          <div className="md:col-span-2 glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="font-extrabold text-white text-base">Supported Delivery Service Areas</h3>
            <div className="overflow-y-auto max-h-[300px] divide-y divide-gray-900 pr-2">
              {pincodes.map((pin) => (
                <div key={pin._id} className="flex items-center justify-between py-3">
                  <span className="font-black text-white text-sm tracking-wider">{pin.code}</span>
                  <button
                    onClick={() => handleRemovePincode(pin._id)}
                    className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-red-500/30 text-gray-500 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {pincodes.length === 0 && (
                <p className="text-xs text-gray-500 py-6 text-center">No service pincodes added. Delivery is fully closed.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TIMINGS TAB ================= */}
      {activeTab === "timings" && (
        <div className="max-w-md glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
          <h3 className="font-extrabold text-white text-base">Set Grocery Store Timings</h3>
          <form onSubmit={handleSaveTimings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Open Hour</label>
                <input
                  type="time"
                  required
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Close Hour</label>
                <input
                  type="time"
                  required
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black py-3 rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              <span>Update Operating Hours</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === "orders" && (
        <StoreAnalyticsPage offlineOrders={orders} />
      )}

      {activeTab === "users" && (
        <UserManagementPage />
      )}
    </div>
  );
}
