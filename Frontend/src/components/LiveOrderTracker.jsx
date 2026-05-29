import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Check, Map, Package, Truck, MapPin } from "lucide-react";

export default function LiveOrderTracker({ order }) {
  const { gpsProgress, isGpsSimulating, updateOrderState } = useContext(AppContext);

  const getStatusNumber = (status) => {
    switch (status) {
      case "CONFIRMED": return 1;
      case "PICKING": return 2;
      case "PACKED": return 3;
      case "ASSIGNED": return 4;
      case "OUT_FOR_DELIVERY": return 5;
      case "DELIVERED": return 6;
      default: return 0;
    }
  };

  const statusNum = getStatusNumber(order.status);
  const steps = ["Placed", "Picking", "Packed", "Rider Dispatched", "On the Way", "Arrived"];

  // Rider position interpolation for the simulated map
  const startCoords = order.store?.location?.coordinates || [77.2197, 28.6304];
  const targetCoords = order.deliveryAddress?.coordinates || [77.2295, 28.6129];
  const progressRatio = gpsProgress / 100;
  
  const currentRiderLng = startCoords[0] + (targetCoords[0] - startCoords[0]) * progressRatio;
  const currentRiderLat = startCoords[1] + (targetCoords[1] - startCoords[1]) * progressRatio;

  // Visual offsets for drawing path on map
  const getMapPixel = (coord, bounds, range) => {
    return ((coord - bounds.min) / range) * 100;
  };

  const bounds = {
    minLng: Math.min(startCoords[0], targetCoords[0]) - 0.005,
    maxLng: Math.max(startCoords[0], targetCoords[0]) + 0.005,
    minLat: Math.min(startCoords[1], targetCoords[1]) - 0.005,
    maxLat: Math.max(startCoords[1], targetCoords[1]) + 0.005,
  };
  const rangeLng = bounds.maxLng - bounds.minLng;
  const rangeLat = bounds.maxLat - bounds.minLat;

  const storeX = getMapPixel(startCoords[0], { min: bounds.minLng }, rangeLng);
  const storeY = 100 - getMapPixel(startCoords[1], { min: bounds.minLat }, rangeLat);
  const userX = getMapPixel(targetCoords[0], { min: bounds.minLng }, rangeLng);
  const userY = 100 - getMapPixel(targetCoords[1], { min: bounds.minLat }, rangeLat);
  const riderX = getMapPixel(currentRiderLng, { min: bounds.minLng }, rangeLng);
  const riderY = 100 - getMapPixel(currentRiderLat, { min: bounds.minLat }, rangeLat);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-emerald-500/10 text-left">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Progress status */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Order ID</h3>
              <p className="text-sm font-black text-white">{order._id}</p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</h3>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                {order.status}
              </span>
            </div>
          </div>

          {/* Stepper progress */}
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-800"></div>
            {steps.map((step, idx) => {
              const active = statusNum >= idx + 1;
              const current = statusNum === idx + 1;

              return (
                <div key={idx} className="flex items-start gap-4 text-sm relative">
                  <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    active 
                      ? "bg-emerald-500 border-emerald-500 text-gray-950 scale-110" 
                      : "bg-gray-950 border-gray-800 text-gray-600"
                  }`}>
                    {active && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                  </div>
                  <div>
                    <h4 className={`font-bold transition-colors ${active ? "text-white" : "text-gray-500"}`}>
                      {step} {current && <span className="text-[10px] uppercase text-emerald-400 font-extrabold ml-2 animate-pulse">● Active</span>}
                    </h4>
                    {idx === 0 && <p className="text-xs text-gray-400">Payment captured. Sent to Dark Store.</p>}
                    {idx === 1 && statusNum >= 2 && <p className="text-xs text-gray-400">Packer has generated list and is picking items.</p>}
                    {idx === 2 && statusNum >= 3 && <p className="text-xs text-gray-400">Bag packed & weight verified.</p>}
                    {idx === 3 && statusNum >= 4 && <p className="text-xs text-gray-400">Rider {order.rider?.fullname || "Priya"} assigned to task.</p>}
                    {idx === 4 && statusNum >= 5 && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Rider in route. ETA: {Math.max(1, Math.round(5 * (1 - progressRatio)))} mins.</p>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${gpsProgress}%` }}></div>
                        </div>
                      </div>
                    )}
                    {idx === 5 && statusNum >= 6 && <p className="text-xs text-gray-400">OTP verified. Order closed safely.</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verification OTP Box (if OUT FOR DELIVERY) */}
          {["ASSIGNED", "OUT_FOR_DELIVERY"].includes(order.status) && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verification OTP</h4>
                <p className="text-xs text-gray-500 mt-1">Provide this to the delivery rider at your door.</p>
              </div>
              <span className="text-2xl font-black tracking-widest text-emerald-400 bg-emerald-500/25 px-4 py-1.5 rounded-lg border border-emerald-500/30">
                {order.otp}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Simulated Geospatial Live GPS Map */}
        <div className="w-full lg:w-96 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Map className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Delivery Coordinate Map</span>
            </span>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">
              GPS Simulated
            </span>
          </div>

          <div className="relative w-full aspect-square bg-[#0E1321] rounded-2xl overflow-hidden border border-gray-800">
            {/* Grid grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            {/* Sourcing Store Marker */}
            <div className="absolute flex flex-col items-center justify-center shrink-0 -translate-x-1/2 -translate-y-1/2" style={{ left: `${storeX}%`, top: `${storeY}%` }}>
              <div className="bg-emerald-500/20 p-1.5 rounded-full border border-emerald-500/40 shadow-lg relative group">
                <Package className="w-4 h-4 text-emerald-400" />
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded whitespace-nowrap hidden group-hover:block font-bold">Store Hub</span>
              </div>
            </div>

            {/* Connecting Delivery Route Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d={`M ${(storeX / 100) * 384} ${(storeY / 100) * 384} L ${(userX / 100) * 384} ${(userY / 100) * 384}`}
                stroke="#10B981"
                strokeWidth="2.5"
                strokeOpacity="0.4"
                className="map-dashed-line"
              />
            </svg>

            {/* Rider marker (Visible from ASSIGNED to OUT_FOR_DELIVERY) */}
            {statusNum >= 4 && statusNum < 6 && (
              <div className="absolute flex flex-col items-center justify-center shrink-0 -translate-x-1/2 -translate-y-1/2 transition-all duration-300" style={{ left: `${riderX}%`, top: `${riderY}%` }}>
                <div className="bg-amber-500 p-2 rounded-full shadow-xl animate-pulse-glow text-gray-950">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Target Customer Marker */}
            <div className="absolute flex flex-col items-center justify-center shrink-0 -translate-x-1/2 -translate-y-1/2" style={{ left: `${userX}%`, top: `${userY}%` }}>
              <div className="bg-violet-500/20 p-1.5 rounded-full border border-violet-500/40 shadow-lg relative group">
                <MapPin className="w-4 h-4 text-violet-400" />
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] bg-violet-950 border border-violet-500/30 text-violet-400 px-1.5 py-0.5 rounded whitespace-nowrap hidden group-hover:block font-bold">Delivery Address</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
