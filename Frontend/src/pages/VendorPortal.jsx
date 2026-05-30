import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import {
  Package, Clock, CheckCircle, Truck, ShoppingBag,
  User, Phone, MapPin, MessageSquare, BadgeIndianRupee,
  ChevronRight, RefreshCw, AlertCircle, TrendingUp
} from "lucide-react";

// ── Status configuration ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PLACED:             { label: "New Order",          color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
  ACCEPTED:           { label: "Accepted",           color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/30"  },
  PACKING:            { label: "Packing",            color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/30"},
  READY_FOR_DELIVERY: { label: "Ready for Delivery", color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/30"  },
  DELIVERED:          { label: "Delivered",          color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30"},
  PAYMENT_RECEIVED:   { label: "Payment Received",   color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20"},
  CANCELLED:          { label: "Cancelled",          color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30"   },
};

// Next-action config: what button to show for each current status
const NEXT_ACTION = {
  PLACED:             { label: "Accept Order",        nextStatus: "ACCEPTED",           btnClass: "bg-blue-500 hover:bg-blue-600 text-white" },
  ACCEPTED:           { label: "Start Packing",       nextStatus: "PACKING",            btnClass: "bg-violet-500 hover:bg-violet-600 text-white" },
  PACKING:            { label: "Mark Ready",          nextStatus: "READY_FOR_DELIVERY", btnClass: "bg-cyan-500 hover:bg-cyan-600 text-gray-950" },
  READY_FOR_DELIVERY: { label: "Mark Delivered",      nextStatus: "DELIVERED",          btnClass: "bg-emerald-500 hover:bg-emerald-600 text-gray-950" },
  DELIVERED:          { label: "Payment Received ✓",  nextStatus: "PAYMENT_RECEIVED",   btnClass: "bg-emerald-400 hover:bg-emerald-500 text-gray-950" },
};

export default function VendorPortal() {
  const { orders, updateOrderState, fetchOrders, user } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("new");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Filter orders by vendor tab ──────────────────────────────────────────
  const newOrders       = orders.filter(o => o.status === "PLACED");
  const activeOrders    = orders.filter(o => ["ACCEPTED", "PACKING", "READY_FOR_DELIVERY"].includes(o.status));
  const deliveredOrders = orders.filter(o => ["DELIVERED", "PAYMENT_RECEIVED"].includes(o.status));
  const cancelledOrders = orders.filter(o => o.status === "CANCELLED");

  const tabOrders = {
    new:       newOrders,
    active:    activeOrders,
    delivered: deliveredOrders,
    cancelled: cancelledOrders,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // ── Summary stats ────────────────────────────────────────────────────────
  const todayRevenue = deliveredOrders
    .filter(o => o.status === "PAYMENT_RECEIVED")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const tabs = [
    { key: "new",       label: "New Orders",   count: newOrders.length,       color: "text-amber-400"   },
    { key: "active",    label: "Active",       count: activeOrders.length,    color: "text-violet-400"  },
    { key: "delivered", label: "Delivered",    count: deliveredOrders.length, color: "text-emerald-400" },
    { key: "cancelled", label: "Cancelled",    count: cancelledOrders.length, color: "text-red-400"     },
  ];

  return (
    <div className="space-y-6 text-left animate-slide-in">

      {/* ── Header ── */}
      <div className="glass-panel p-5 rounded-3xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-violet-radial">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            Vendor Dashboard
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage incoming orders · {user?.fullname || "Store Vendor"}
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 flex-wrap">
          <StatChip label="New" value={newOrders.length}    color="text-amber-400" />
          <StatChip label="Active" value={activeOrders.length} color="text-violet-400" />
          <StatChip label="Revenue" value={`₹${todayRevenue}`} color="text-emerald-400" />
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer"
            title="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div className="flex gap-2 flex-wrap bg-gray-900/60 p-1.5 rounded-2xl border border-gray-800 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-gray-800 text-white shadow-md"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`${tab.color} font-black`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Order list ── */}
      <div className="space-y-4">
        {tabOrders[activeTab].length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          tabOrders[activeTab].map(order => (
            <OrderCard key={order._id} order={order} />
          ))
        )}
      </div>

    </div>
  );
}

// ── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const { updateOrderState } = useContext(AppContext);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const cfg    = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED;
  const action = NEXT_ACTION[order.status];

  const customer = order.customer || {};
  const address  = order.deliveryAddress || {};
  const items    = order.items || [];
  const isPaid   = order.paymentStatus === "PAID" || order.status === "PAYMENT_RECEIVED";

  const handleAction = async () => {
    if (!action || isUpdating) return;
    setIsUpdating(true);
    await updateOrderState(order._id, action.nextStatus);
    setIsUpdating(false);
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-IN", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
      })
    : "";

  return (
    <div className={`glass-panel rounded-2xl border overflow-hidden transition-all ${cfg.border}`}>

      {/* Card header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2 rounded-xl ${cfg.bg} shrink-0`}>
            <Package className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-white text-sm">
                #{order._id?.slice(-8).toUpperCase()}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                {cfg.label}
              </span>
              {isPaid && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  COD Collected
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-emerald-400 font-black text-base">₹{order.total || 0}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg bg-gray-900/60 border border-gray-800 text-gray-500 hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>

      {/* Customer quick-info row (always visible) */}
      <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">

        <InfoChip icon={User} label="Customer" value={customer.fullname || "—"} />
        <InfoChip icon={Phone} label="Phone" value={customer.phone || "—"} />
        <InfoChip icon={MapPin} label="Delivery Area"
          value={address.text ? address.text.split(",").slice(-2).join(",").trim() : "—"}
        />

      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-800/60 px-4 py-4 space-y-4 animate-slide-in">

          {/* Full delivery address */}
          <div className="bg-gray-900/40 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Full Delivery Address</p>
            <p className="text-sm text-white">{address.text || "No address provided"}</p>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Customer Note</p>
                <p className="text-sm text-white mt-0.5">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Items list */}
          <div className="space-y-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Order Items ({items.length})</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-900 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={item.product?.name}
                        className="w-8 h-8 rounded-lg object-cover bg-gray-800 shrink-0"
                      />
                    )}
                    <span className="text-xs text-white font-semibold truncate">{item.product?.name || "Product"}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs text-gray-400">×{item.quantity}</span>
                    <span className="text-xs text-emerald-400 font-bold ml-2">₹{(item.price || 0) * (item.quantity || 1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment summary */}
          <div className="bg-gray-900/40 rounded-xl p-3 space-y-1.5">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <BadgeIndianRupee className="w-3.5 h-3.5" /> COD Payment Summary
            </p>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Subtotal</span><span className="text-white font-bold">₹{order.subtotal || 0}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Delivery Fee</span>
              <span className={order.deliveryFee === 0 ? "text-emerald-400 font-bold" : "text-white font-bold"}>
                {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black border-t border-gray-800 pt-1.5 mt-1">
              <span className="text-white">Total COD</span>
              <span className="text-emerald-400">₹{order.total || 0}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-500">Payment Status</span>
              <span className={isPaid ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {isPaid ? "✓ Collected" : "Pending Collection"}
              </span>
            </div>
          </div>

          {/* Order Timeline */}
          {order.timeline?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Order Timeline</p>
              <div className="space-y-1.5">
                {order.timeline.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-white">{STATUS_CONFIG[t.status]?.label || t.status}</span>
                    <span className="text-gray-500 ml-auto">
                      {new Date(t.timestamp).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      {action && (
        <div className="border-t border-gray-800/60 p-4">
          <button
            onClick={handleAction}
            disabled={isUpdating}
            className={`w-full font-black text-sm uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${action.btnClass}`}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <span>{action.label}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}

// ── Helper Components ────────────────────────────────────────────────────────
function StatChip({ label, value, color }) {
  return (
    <div className="bg-gray-950/60 px-4 py-2.5 rounded-2xl border border-gray-900 text-left">
      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{label}</p>
      <p className={`text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="bg-gray-900/40 rounded-xl p-3 flex items-start gap-2 min-w-0">
      <Icon className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-xs text-white font-semibold mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ tab }) {
  const messages = {
    new:       { icon: Clock,        title: "No New Orders",      body: "New customer orders will appear here as soon as they are placed." },
    active:    { icon: Package,      title: "No Active Orders",   body: "Accepted and packing orders will show here." },
    delivered: { icon: CheckCircle,  title: "No Delivered Orders", body: "Completed deliveries and collected payments appear here." },
    cancelled: { icon: AlertCircle,  title: "No Cancelled Orders", body: "Any cancelled orders will appear in this tab." },
  };
  const m = messages[tab] || messages.new;
  const Icon = m.icon;

  return (
    <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
      <Icon className="w-12 h-12 text-gray-700 mx-auto" />
      <h4 className="font-bold text-white">{m.title}</h4>
      <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">{m.body}</p>
    </div>
  );
}
