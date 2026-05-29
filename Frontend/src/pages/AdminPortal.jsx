import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import StoreAnalyticsPage from "./StoreAnalyticsPage";
import UserManagementPage from "./UserManagementPage";
import { Compass, Search, CheckCircle, Check, Truck } from "lucide-react";

export default function AdminPortal() {
  const { orders, updateOrderState, assignRiderToOrder, products, adjustStock, nearestStore } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("queue"); // queue, inventory, analytics, users
  const [searchStock, setSearchStock] = useState("");

  const pendingOrders = orders.filter(o => !["DELIVERED", "CANCELLED"].includes(o.status));

  // Simulated items checked list per order
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItemCheck = (orderId, itemId) => {
    setCheckedItems(prev => {
      const key = `${orderId}-${itemId}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  return (
    <div className="space-y-6 text-left animate-slide-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Compass className="w-7 h-7 text-emerald-400" />
            <span>Dark Store Fulfillment OS</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Sourcing Center: <strong className="text-white">{nearestStore?.name}</strong></p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 bg-gray-900/60 p-1 rounded-xl border border-gray-800 shrink-0">
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === "queue"
                ? "bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/10"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Fulfillment Queue ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === "inventory"
                ? "bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/10"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Inventory Control
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/10"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/10"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {activeTab === "queue" ? (
        <div className="space-y-6">
          {pendingOrders.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500/40 mx-auto" />
              <h4 className="font-bold text-white text-lg">All Cleared!</h4>
              <p className="text-xs text-gray-500">No active customer orders currently waiting in queue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingOrders.map((order) => (
                <div key={order._id} className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-gray-900 pb-3">
                    <div>
                      <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Order ID</h4>
                      <p className="text-sm font-extrabold text-white">{order._id}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">State</h4>
                      <span className="text-[11px] font-bold text-emerald-400">{order.status}</span>
                    </div>
                  </div>

                  {/* Customer and Sourcing Info */}
                  <div className="text-xs text-gray-400 space-y-1 bg-gray-950/40 p-3 rounded-xl border border-gray-900">
                    <p><strong>Customer:</strong> {order.customer?.fullname || "Alex Carter"}</p>
                    <p><strong>Deliver To:</strong> {order.deliveryAddress?.text}</p>
                  </div>

                  {/* Items Picking Checklist */}
                  <div className="space-y-2 text-sm">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Picking list checklist</h4>
                    <div className="space-y-1.5 divide-y divide-gray-900">
                      {order.items.map((item, idx) => {
                        const isChecked = checkedItems[`${order._id}-${item.product._id}`];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleItemCheck(order._id, item.product._id)}
                            className="flex items-center justify-between py-2 text-xs text-gray-300 cursor-pointer hover:bg-gray-900/40 px-2 rounded transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                isChecked ? "bg-emerald-500 border-emerald-500 text-gray-950" : "border-gray-800 bg-gray-950"
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                              </div>
                              <span className={isChecked ? "line-through text-gray-500" : ""}>{item.product?.name}</span>
                            </div>
                            <span className="font-extrabold text-white bg-gray-900 px-2 py-0.5 rounded border border-gray-800">x{item.quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Packer Action Controls based on status */}
                  <div className="border-t border-gray-900 pt-4 flex flex-wrap items-center justify-between gap-3">
                    
                    {order.status === "CONFIRMED" && (
                      <button
                        onClick={() => updateOrderState(order._id, "PICKING")}
                        className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-xs uppercase px-4 py-2.5 rounded-xl cursor-pointer"
                      >
                        Start Picking Items
                      </button>
                    )}

                    {order.status === "PICKING" && (
                      <button
                        onClick={() => updateOrderState(order._id, "PACKED")}
                        className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-xs uppercase px-4 py-2.5 rounded-xl cursor-pointer"
                      >
                        Mark Order Packed
                      </button>
                    )}

                    {order.status === "PACKED" && (
                      <div className="w-full flex items-center justify-between gap-4">
                        <div className="text-left">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Rider Dispatch</p>
                          <p className="text-xs text-gray-300 mt-1">Verify bag weight. Dispatch partner.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => assignRiderToOrder(order._id, "r1")}
                            className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs uppercase px-3 py-2 rounded-xl cursor-pointer"
                          >
                            Assign Rohit
                          </button>
                          <button
                            onClick={() => assignRiderToOrder(order._id, "r2")}
                            className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs uppercase px-3 py-2 rounded-xl cursor-pointer"
                          >
                            Assign Priya
                          </button>
                        </div>
                      </div>
                    )}

                    {order.status === "ASSIGNED" && (
                      <p className="text-xs text-gray-500">Rider {order.rider?.fullname || "Priya"} is picking up order package...</p>
                    )}

                    {order.status === "OUT_FOR_DELIVERY" && (
                      <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                        <Truck className="w-4 h-4 shrink-0" />
                        <span>Delivery partner is in transit with package...</span>
                      </p>
                    )}

                    <button
                      onClick={() => updateOrderState(order._id, "CANCELLED")}
                      className="text-[11px] font-bold text-red-500 hover:text-red-400 uppercase py-1.5"
                    >
                      Cancel Order
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Inventory adjust dashboard */
        activeTab === "inventory" ? (
        <div className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-900 pb-4">
            <h3 className="font-extrabold text-white text-base">Adjust Sourcing Inventory stock levels</h3>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search stock..."
                value={searchStock}
                onChange={(e) => setSearchStock(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-900 text-gray-500 uppercase tracking-widest text-[9px] font-black">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Retail Price</th>
                  <th className="py-3 px-4 text-right">Physical Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900 font-semibold text-gray-300">
                {products
                  .filter(p => p.name.toLowerCase().includes(searchStock.toLowerCase()))
                  .map((p) => (
                    <tr key={p._id} className="hover:bg-gray-900/20">
                      <td className="py-3.5 px-4 font-bold text-white">{p.name}</td>
                      <td className="py-3.5 px-4 text-gray-500">{p.sku}</td>
                      <td className="py-3.5 px-4 uppercase text-[10px] text-emerald-400 bg-emerald-500/5 w-fit border border-emerald-500/10 px-2 py-0.5 rounded">{p.category}</td>
                      <td className="py-3.5 px-4 text-emerald-400">₹{p.price}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            onClick={() => adjustStock(p._id, Math.max(0, p.stock - 5))}
                            className="bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white p-1 rounded cursor-pointer"
                          >
                            -5
                          </button>
                          <span className={`w-8 text-center font-extrabold ${p.stock <= 5 ? "text-amber-400" : "text-white"}`}>
                            {p.stock}
                          </span>
                          <button
                            onClick={() => adjustStock(p._id, p.stock + 5)}
                            className="bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white p-1 rounded cursor-pointer"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        ) : null
      )}

      {activeTab === "analytics" && (
        <StoreAnalyticsPage offlineOrders={orders} />
      )}

      {activeTab === "users" && (
        <UserManagementPage />
      )}
    </div>
  );
}
