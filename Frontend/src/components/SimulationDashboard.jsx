import React, { useState, useContext } from "react";
import { AppContext, MOCK_PRODUCTS } from "../context/AppContext";
import { Sparkles, X, RotateCcw } from "lucide-react";

export default function SimulationDashboard() {
  const {
    role, setRole,
    offlineMode, setOfflineMode,
    activeOrder, updateOrderState,
    setProducts,
    gpsProgress,
    isGpsSimulating, setIsGpsSimulating,
    simulationSpeed, setSimulationSpeed,
    resetGpsSimulation
  } = useContext(AppContext);

  const [expanded, setExpanded] = useState(true);

  const simulateRiderGlide = () => {
    if (!activeOrder) {
      alert("No active order to simulate GPS navigation!");
      return;
    }
    if (activeOrder.status !== "OUT_FOR_DELIVERY") {
      // automatically transition to Out for delivery
      updateOrderState(activeOrder._id, "OUT_FOR_DELIVERY");
    }
    resetGpsSimulation();
    setIsGpsSimulating(true);
  };

  const forceAutoCompleteOrder = () => {
    if (!activeOrder) return;
    updateOrderState(activeOrder._id, "DELIVERED", activeOrder.otp);
  };

  const simulateStockFill = () => {
    setProducts(MOCK_PRODUCTS.map(p => ({ ...p, stock: 45 })));
    alert("Simulated database stocks successfully replenished (+45 items all slots)!");
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-6 right-6 z-50 bg-violet-600 hover:bg-violet-500 text-white font-extrabold px-4 py-3 rounded-full shadow-2xl border border-violet-400/30 flex items-center gap-1.5 transition-all text-xs cursor-pointer uppercase tracking-wider"
      >
        <Sparkles className="w-4 h-4" />
        <span>Simulation Deck</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#0D111A]/95 backdrop-blur-md border border-violet-500/30 p-5 rounded-3xl shadow-2xl space-y-4 animate-slide-in">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <span className="text-xs font-black uppercase text-violet-400 tracking-widest flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fulfillment Simulator Deck</span>
        </span>
        <button onClick={() => setExpanded(false)} className="text-gray-500 hover:text-white p-0.5 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        
        {/* Toggle Server offline / local mode */}
        <div className="col-span-2 flex items-center justify-between bg-gray-950/60 p-2 rounded-xl border border-gray-800 text-left">
          <div>
            <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">App Mode</h4>
            <span className={`text-[10px] font-bold ${offlineMode ? "text-amber-400" : "text-emerald-400"}`}>
              {offlineMode ? "● Offline Local Simulation" : "● Connected Mongoose Database"}
            </span>
          </div>
          <button
            onClick={() => setOfflineMode(!offlineMode)}
            className="bg-gray-900 border border-gray-800 hover:border-violet-500/40 text-[9px] font-black uppercase text-gray-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Force Toggle
          </button>
        </div>

        {/* Change Active Role instantly */}
        <div className="col-span-2 space-y-1 text-left">
          <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Switch View Role</h4>
          <div className="grid grid-cols-3 gap-1 bg-gray-950/80 p-1 rounded-xl border border-gray-800">
            {["user", "admin", "rider"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all capitalize cursor-pointer ${
                  role === r
                    ? "bg-violet-600 text-white font-black"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {r === "user" ? "Customer" : r === "admin" ? "Packer" : "Rider"}
              </button>
            ))}
          </div>
        </div>

        {/* GPS Controls */}
        <div className="col-span-2 border-t border-gray-900 pt-3 space-y-2 text-left">
          <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Simulate GPS Navigation</h4>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={simulateRiderGlide}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-[10px] uppercase py-2 rounded-xl cursor-pointer shadow-md"
            >
              Start Rider GPS
            </button>
            <button
              onClick={forceAutoCompleteOrder}
              disabled={!activeOrder || activeOrder.status === "DELIVERED"}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-950 font-black text-[10px] uppercase py-2 rounded-xl cursor-pointer"
            >
              Skip & Deliver
            </button>
          </div>
          {activeOrder && (
            <div className="space-y-1 text-[10px] text-gray-400 bg-gray-950/40 p-2.5 rounded-xl border border-gray-900">
              <p>GPS Path: <strong>{gpsProgress}%</strong> {isGpsSimulating ? "🚴 Riding..." : "Paused"}</p>
              <div className="flex items-center justify-between mt-1 text-[9px]">
                <span>Speed Boost:</span>
                <div className="flex gap-1.5 font-bold">
                  {[1, 2, 5].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setSimulationSpeed(speed)}
                      className={`px-1.5 py-0.5 rounded border border-gray-800 ${
                        simulationSpeed === speed ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "text-gray-500"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Database Fill Operations */}
        <button
          onClick={simulateStockFill}
          className="col-span-2 bg-gray-900 border border-gray-800 hover:border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase py-2 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span>Replenish Store Inventory</span>
        </button>

      </div>
    </div>
  );
}
