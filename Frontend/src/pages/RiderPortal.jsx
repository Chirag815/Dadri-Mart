import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Power, Truck, Clock, Package, MapPin } from "lucide-react";

export default function RiderPortal() {
  const { orders, updateOrderState } = useContext(AppContext);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [riderEarnings, setRiderEarnings] = useState(240);
  const [otpInputs, setOtpInputs] = useState({});

  const availableDeliveries = orders.filter(o => o.status === "PACKED" && !o.rider);
  const myDeliveries = orders.filter(o => o.rider?._id === "r1" || o.rider === "r1" || o.rider?._id === "r2" || o.rider === "r2");

  const pendingDeliveries = myDeliveries.filter(o => !["DELIVERED", "CANCELLED"].includes(o.status));
  const completedDeliveries = myDeliveries.filter(o => o.status === "DELIVERED");

  const acceptDeliverySimulate = (orderId) => {
    updateOrderState(orderId, "ASSIGNED");
  };

  const handleOtpSubmit = (orderId, correctOtp) => {
    const input = otpInputs[orderId] || "";
    if (input.toString().trim() === correctOtp.toString().trim()) {
      updateOrderState(orderId, "DELIVERED", input);
      setRiderEarnings(prev => prev + 45); // add delivery payout Rs 45
      alert("Delivery cleared successfully! Payout added.");
    } else {
      alert("Invalid OTP! Customer verification failed.");
    }
  };

  return (
    <div className="space-y-6 text-left animate-slide-in">
      
      {/* Earnings & Duty header */}
      <div className="glass-panel p-5 rounded-3xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-violet-radial">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Duty Status</span>
            <button
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`p-1 rounded-full w-10 h-5 flex items-center transition-all ${
                isOnDuty ? "bg-emerald-500 justify-end" : "bg-gray-800 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-gray-950 shadow-md"></div>
            </button>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">Delivery Partner Dashboard</h2>
        </div>

        <div className="flex gap-4">
          <div className="bg-gray-950/60 px-4 py-3 rounded-2xl border border-gray-900 text-left">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Duty Earnings</span>
            <p className="text-xl font-black text-emerald-400">₹{riderEarnings}</p>
          </div>
          <div className="bg-gray-950/60 px-4 py-3 rounded-2xl border border-gray-900 text-left">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Trips Done</span>
            <p className="text-xl font-black text-white">{completedDeliveries.length}</p>
          </div>
        </div>
      </div>

      {!isOnDuty ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-2">
          <Power className="w-12 h-12 text-gray-600 mx-auto" />
          <h4 className="font-bold text-white">Offline Duty</h4>
          <p className="text-xs text-gray-500">Go online to receive nearby quick-grocery delivery tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Work list column */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-extrabold text-white text-base">Your Active Delivery Tasks ({pendingDeliveries.length})</h3>
            
            {pendingDeliveries.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center space-y-2">
                <Truck className="w-10 h-10 text-gray-600 mx-auto" />
                <h4 className="font-bold text-white text-sm">No Active Trips</h4>
                <p className="text-xs text-gray-500">Select and accept packed orders from the duty queue feed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDeliveries.map((order) => (
                  <div key={order._id} className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-900 pb-3">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Order ID</span>
                        <p className="text-sm font-extrabold text-white">{order._id}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{order.status}</span>
                    </div>

                    {/* Sourcing & Address detail */}
                    <div className="space-y-3 text-xs text-gray-300">
                      <div className="flex gap-2">
                        <Package className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white">Store Source Address</p>
                          <p className="text-gray-400 mt-0.5">{order.store?.address}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <MapPin className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white">Customer Delivery Address</p>
                          <p className="text-gray-400 mt-0.5">{order.deliveryAddress?.text}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions based on rider status */}
                    <div className="border-t border-gray-900 pt-4 flex flex-wrap items-center justify-between gap-4">
                      
                      {order.status === "ASSIGNED" && (
                        <button
                          onClick={() => updateOrderState(order._id, "OUT_FOR_DELIVERY")}
                          className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-xs uppercase px-4 py-2.5 rounded-xl cursor-pointer"
                        >
                          Mark Out for Delivery
                        </button>
                      )}

                      {order.status === "OUT_FOR_DELIVERY" && (
                        <div className="w-full flex items-center justify-between gap-4 bg-gray-950/60 p-3 rounded-xl border border-gray-900">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Verify Secure OTP</p>
                            <p className="text-xs text-gray-400 mt-0.5">Collect the 4-digit code from customer.</p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength="4"
                              placeholder="0000"
                              value={otpInputs[order._id] || ""}
                              onChange={(e) => setOtpInputs({ ...otpInputs, [order._id]: e.target.value })}
                              className="w-20 bg-gray-900 border border-gray-800 rounded-lg text-center text-white font-extrabold text-sm"
                            />
                            <button
                              onClick={() => handleOtpSubmit(order._id, order.otp)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      )}

                      <span className="text-[10px] text-gray-500 font-bold uppercase">Simulated payout: ₹45.00</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Duty Queue feed column */}
          <div className="space-y-6">
            <h3 className="font-extrabold text-white text-base">Active Duty Queue Feed</h3>
            
            {availableDeliveries.length === 0 ? (
              <div className="glass-panel p-6 rounded-2xl text-center space-y-2">
                <Clock className="w-8 h-8 text-gray-600 mx-auto" />
                <h4 className="font-bold text-white text-xs">Waiting for packed bags...</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Admin packers are currently preparing grocery bags at store counters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableDeliveries.map((order) => (
                  <div key={order._id} className="glass-panel p-4 rounded-xl border border-gray-800 space-y-3 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Order {order._id.substring(0, 8)}...</span>
                      <span className="text-emerald-400">₹45 Payout</span>
                    </div>
                    <p className="text-gray-400">Sourcing Hub: <strong>{order.store?.name}</strong></p>
                    <p className="text-gray-400 max-w-[200px] truncate">Delivery to: {order.deliveryAddress?.text}</p>
                    <button
                      onClick={() => acceptDeliverySimulate(order._id)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-[11px] uppercase tracking-wider py-2 rounded-lg cursor-pointer"
                    >
                      Accept Delivery
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
