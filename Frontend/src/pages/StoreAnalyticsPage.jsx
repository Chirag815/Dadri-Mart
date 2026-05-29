import React, { useMemo } from "react";
import { useAdminOrders, useAllStores } from "../hooks/useKartly";
import {
  TrendingUp,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Store,
  DollarSign,
  BarChart2,
  Loader2,
} from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-gray-800 flex items-start gap-4">
      <div className={`p-3 rounded-xl border ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest truncate">{label}</p>
        <p className="text-2xl font-black text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function StoreAnalyticsPage({ offlineOrders = [] }) {
  const { data: orders, isLoading } = useAdminOrders();
  const { data: stores } = useAllStores();
  const allOrders = orders || offlineOrders;

  const stats = useMemo(() => {
    const total = allOrders.length;
    const delivered = allOrders.filter((o) => o.status === "DELIVERED").length;
    const cancelled = allOrders.filter((o) => o.status === "CANCELLED").length;
    const active = allOrders.filter(
      (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
    ).length;
    const gmv = allOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = delivered > 0
      ? Math.round(allOrders.filter(o => o.status === "DELIVERED").reduce((s, o) => s + o.total, 0) / delivered)
      : 0;

    return { total, delivered, cancelled, active, gmv, avgOrderValue };
  }, [allOrders]);

  // Category breakdown from all order items
  const categoryBreakdown = useMemo(() => {
    const counts = {};
    allOrders.forEach((o) => {
      o.items?.forEach((item) => {
        const cat = item.product?.category || "unknown";
        counts[cat] = (counts[cat] || 0) + item.quantity;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [allOrders]);

  const maxCategoryCount = categoryBreakdown[0]?.[1] || 1;

  // Status breakdown
  const statusCounts = useMemo(() => {
    const m = {};
    allOrders.forEach((o) => {
      m[o.status] = (m[o.status] || 0) + 1;
    });
    return m;
  }, [allOrders]);

  const STATUS_COLORS = {
    CONFIRMED: "bg-blue-500",
    PICKING: "bg-amber-500",
    PACKED: "bg-purple-500",
    ASSIGNED: "bg-cyan-500",
    OUT_FOR_DELIVERY: "bg-emerald-500",
    DELIVERED: "bg-emerald-600",
    CANCELLED: "bg-red-500",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-semibold">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart2 className="w-7 h-7 text-emerald-400" />
          <span>Store Analytics</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Real-time operations intelligence across {stores?.length || 3} fulfillment hubs
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Orders"
          value={stats.total}
          icon={Package}
          color="bg-blue-500/10 border-blue-500/20 text-blue-400"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          sub={stats.total > 0 ? `${Math.round((stats.delivered / stats.total) * 100)}% fulfillment rate` : "—"}
          icon={CheckCircle}
          color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        />
        <StatCard
          label="Active Orders"
          value={stats.active}
          sub="In pipeline right now"
          icon={Clock}
          color="bg-amber-500/10 border-amber-500/20 text-amber-400"
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelled}
          sub={stats.total > 0 ? `${Math.round((stats.cancelled / stats.total) * 100)}% cancellation` : "—"}
          icon={XCircle}
          color="bg-red-500/10 border-red-500/20 text-red-400"
        />
        <StatCard
          label="Total GMV"
          value={`₹${stats.gmv.toLocaleString()}`}
          sub="Gross Merchandise Value"
          icon={TrendingUp}
          color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        />
        <StatCard
          label="Avg Order Value"
          value={stats.avgOrderValue > 0 ? `₹${stats.avgOrderValue}` : "—"}
          sub="Per delivered order"
          icon={DollarSign}
          color="bg-purple-500/10 border-purple-500/20 text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Order Status Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            Order Status Distribution
          </h3>
          {Object.entries(statusCounts).length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No order data available yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const pct = Math.round((count / stats.total) * 100);
                  return (
                    <div key={status} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-gray-300">{status.replace(/_/g, " ")}</span>
                        <span className="font-extrabold text-white">{count} <span className="text-gray-500 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[status] || "bg-gray-600"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Category Demand */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            Category Demand (by quantity sold)
          </h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">Place orders to see category breakdown.</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map(([cat, qty]) => {
                const pct = Math.round((qty / maxCategoryCount) * 100);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-300 capitalize">{cat}</span>
                      <span className="font-extrabold text-white">{qty} units</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Store Health Cards */}
      {stores && stores.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Store className="w-4 h-4 text-violet-400" />
            Dark Store Hub Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stores.map((store) => {
              const storeOrders = allOrders.filter(
                (o) => o.store?._id === store._id || o.store === store._id
              );
              const storeGMV = storeOrders
                .filter((o) => o.status !== "CANCELLED")
                .reduce((sum, o) => sum + (o.total || 0), 0);

              return (
                <div key={store._id} className="glass-card p-4 rounded-2xl border border-gray-800 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Active</span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm leading-tight">{store.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 truncate">{store.address}</p>
                  <div className="mt-3 pt-3 border-t border-gray-900 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Orders</p>
                      <p className="font-extrabold text-white">{storeOrders.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">GMV</p>
                      <p className="font-extrabold text-emerald-400">₹{storeGMV.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
