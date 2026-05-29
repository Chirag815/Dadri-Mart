import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import AddressManagementPage from "./AddressManagementPage";
import OrderHistoryPage from "./OrderHistoryPage";
import LiveOrderTracker from "../components/LiveOrderTracker";
import { Sparkles, Search, Minus, Plus } from "lucide-react";

export default function CustomerPortal() {
  const { products, addToCart, cart, activeOrder, nearestStore, orders } = useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customerTab, setCustomerTab] = useState("shop"); // shop | orders | address

  const categories = ["all", "vegetables", "dairy", "bakery", "beverages", "snacks", "household"];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const removeFromCart = (productId) => {
    const { removeFromCart: contextRemove } = useContext(AppContext);
    contextRemove(productId);
  };

  return (
    <div className="space-y-6 animate-slide-in">

      {/* Customer Tab Navigation */}
      <div className="flex gap-2 bg-gray-900/60 p-1 rounded-xl border border-gray-800 w-fit">
        {[
          { key: "shop", label: "🛒 Shop" },
          { key: "orders", label: "📦 My Orders" },
          { key: "address", label: "📍 Address" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setCustomerTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              customerTab === t.key
                ? "bg-emerald-500 text-gray-950 shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Address Management Tab */}
      {customerTab === "address" && <AddressManagementPage />}

      {/* Order History Tab */}
      {customerTab === "orders" && <OrderHistoryPage offlineOrders={orders} />}

      {/* Shopping Tab */}
      {customerTab === "shop" && (
        <div className="space-y-8">
          {/* Banner / Store info */}
          <div className="glass-panel p-6 rounded-3xl border border-gray-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-violet-radial">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>Superfast Delivery Enabled</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                Order Groceries in <span className="text-gradient-emerald">10 Minutes</span>
              </h2>
              <p className="text-xs md:text-sm text-gray-400">
                Selected sourcing dark store: <span className="text-emerald-400 font-bold">{nearestStore?.name || "Locating Nearest..."}</span>
              </p>
            </div>
            {nearestStore && (
              <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800 text-left md:max-w-xs w-full">
                <h4 className="font-bold text-white text-xs uppercase tracking-widest text-gray-500 mb-1">Dark Store Hub</h4>
                <p className="text-sm font-extrabold text-white truncate">{nearestStore.name}</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-[220px] line-clamp-2 leading-relaxed">{nearestStore.address}</p>
              </div>
            )}
          </div>

          {/* Live Order Tracker Section (Appears at top if active order exists) */}
          {activeOrder && (
            <div className="animate-slide-in">
              <div className="bg-gray-900/40 p-1.5 rounded-3xl border border-emerald-500/20 bg-gradient-radial">
                <LiveOrderTracker order={activeOrder} />
              </div>
            </div>
          )}

          {/* Product Discovery Filter Block */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Categories Tab slider */}
            <div className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase shrink-0 transition-all border cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-emerald-500 text-gray-950 border-emerald-500 font-black shadow-lg shadow-emerald-500/20"
                      : "bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input bar */}
            <div className="relative w-full md:max-w-xs shrink-0">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search groceries, essentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-3 rounded-full text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredProducts.map((p) => {
              const cartItem = cart.find(item => item.product._id === p._id);
              const isOutOfStock = p.stock <= 0;

              return (
                <ProductCard key={p._id} p={p} cartItem={cartItem} isOutOfStock={isOutOfStock} />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ p, cartItem, isOutOfStock }) {
  const { addToCart, removeFromCart } = useContext(AppContext);

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between">
      <div className="relative group">
        <img
          src={p.image}
          alt={p.name}
          className="w-full aspect-square object-cover bg-gray-900 transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-2 left-2 text-[9px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
          {p.category}
        </span>
        
        {p.stock <= 5 && p.stock > 0 && (
          <span className="absolute top-2 right-2 text-[9px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
            Only {p.stock} left
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="text-red-400 border border-red-500/40 bg-red-500/15 font-black text-xs uppercase px-3 py-1.5 rounded-lg tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-white line-clamp-1 leading-tight">{p.name}</h3>
          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{p.description}</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-emerald-400 font-extrabold text-sm">₹{p.price}</span>
            {p.mrp > p.price && (
              <span className="text-gray-500 text-[10px] line-through ml-1.5 font-bold">₹{p.mrp}</span>
            )}
          </div>

          {cartItem ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-2 py-1">
              <button
                onClick={() => removeFromCart(p._id)}
                className="text-emerald-400 hover:text-emerald-300 font-bold p-0.5 shrink-0 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-white font-extrabold text-xs min-w-[12px] text-center">{cartItem.quantity}</span>
              <button
                onClick={() => addToCart(p)}
                className="text-emerald-400 hover:text-emerald-300 font-bold p-0.5 shrink-0 cursor-pointer"
                disabled={cartItem.quantity >= p.stock}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(p)}
              disabled={isOutOfStock}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-950 font-black text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
