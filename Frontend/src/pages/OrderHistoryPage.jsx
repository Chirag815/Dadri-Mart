import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useCustomerOrders } from "../hooks/useKartly";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  MapPin,
  Loader2,
} from "lucide-react";

const STATUS_CONFIG = {
  CONFIRMED:        { color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",   icon: Clock },
  PICKING:          { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",  icon: Package },
  PACKED:           { color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20", icon: Package },
  ASSIGNED:         { color: "text-cyan-400",    bg: "bg-cyan-500/10 border-cyan-500/20",    icon: Truck },
  OUT_FOR_DELIVERY: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: Truck },
  DELIVERED:        { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  CANCELLED:        { color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",      icon: XCircle },
};

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Offline fallback mock orders
const MOCK_ORDERS = [];

export default function OrderHistoryPage({ offlineOrders = [] }) {
  const { data: liveOrders, isLoading, isError } = useCustomerOrders();
  const orders = isError || !liveOrders ? offlineOrders : liveOrders;

  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter((o) => {
        if (filter === "active") return !["DELIVERED", "CANCELLED"].includes(o.status);
        if (filter === "delivered") return o.status === "DELIVERED";
        if (filter === "cancelled") return o.status === "CANCELLED";
        return true;
      });

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-emerald-400" />
            <span>Order History</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Track your past and active orders · {orders.length} total orders
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 bg-gray-900/60 p-1 rounded-xl border border-gray-800 shrink-0">
          {["all", "active", "delivered", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer capitalize ${
                filter === f
                  ? "bg-emerald-500 text-gray-950 shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">Loading order history...</span>
        </div>
      )}

      {!isLoading && filteredOrders.length === 0 && (
        <div className="glass-panel p-16 rounded-3xl text-center space-y-3">
          <ShoppingBag className="w-14 h-14 text-gray-700 mx-auto" />
          <h4 className="font-bold text-white text-lg">No Orders Found</h4>
          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            {filter === "all"
              ? "You haven't placed any orders yet. Browse the catalog to get started!"
              : `No ${filter} orders to show right now.`}
          </p>
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.CONFIRMED;
          const StatusIcon = cfg.icon;
          const isExpanded = expandedId === order._id;
          const isActive = !["DELIVERED", "CANCELLED"].includes(order.status);

          return (
            <div
              key={order._id}
              className={`glass-panel rounded-2xl border overflow-hidden transition-all ${
                isActive ? "border-emerald-500/20" : "border-gray-800"
              }`}
            >
              {/* Card summary header — always visible */}
              <div
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => toggleExpand(order._id)}
              >
                {/* Status badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 ${cfg.bg} ${cfg.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{order.status.replace(/_/g, " ")}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Order ID</p>
                  <p className="text-sm font-extrabold text-white truncate">{order._id}</p>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {order.store?.name || "Dark Store"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      {formatDate(order.createdAt)}
                    </span>
                    {isActive && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                        ● Live
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total</p>
                    <p className="text-lg font-black text-emerald-400">₹{order.total}</p>
                  </div>
                  <div className="text-gray-500">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded detail section */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-5 space-y-5 animate-slide-in">

                  {/* Items list */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Items Ordered</h4>
                    <div className="divide-y divide-gray-900">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-2.5">
                          <img
                            src={item.product?.image || "https://placehold.co/60x60"}
                            alt={item.product?.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-950 border border-gray-900 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{item.product?.name}</p>
                            <p className="text-xs text-gray-500">₹{item.price} × {item.quantity}</p>
                          </div>
                          <p className="text-sm font-extrabold text-white shrink-0">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing breakdown */}
                  <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-900 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>₹{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Delivery Fee</span>
                      <span>{order.deliveryFee === 0 ? <span className="text-emerald-400 font-bold text-xs">FREE</span> : `₹${order.deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-white border-t border-gray-800 pt-2">
                      <span>Total Paid</span>
                      <span className="text-emerald-400">₹{order.total}</span>
                    </div>
                  </div>

                  {/* Delivery info + OTP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-900 space-y-1">
                      <p className="text-gray-500 uppercase font-bold tracking-widest">Delivery Address</p>
                      <p className="text-white font-semibold leading-relaxed">
                        {order.deliveryAddress?.text || "—"}
                      </p>
                    </div>
                    {["ASSIGNED", "OUT_FOR_DELIVERY"].includes(order.status) && order.otp && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl space-y-1">
                        <p className="text-emerald-400/70 uppercase font-bold tracking-widest">Delivery OTP</p>
                        <p className="text-2xl font-black tracking-widest text-emerald-400">{order.otp}</p>
                        <p className="text-gray-500 text-[10px]">Share with rider at door</p>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  {order.timeline && order.timeline.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status Timeline</h4>
                      <div className="relative pl-5 space-y-3">
                        <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gray-800"></div>
                        {order.timeline.map((t, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-xs relative">
                            <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-500 shrink-0"></div>
                            <div>
                              <span className="font-bold text-white">{t.status.replace(/_/g, " ")}</span>
                              <span className="text-gray-500 ml-2">{formatDate(t.timestamp)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
