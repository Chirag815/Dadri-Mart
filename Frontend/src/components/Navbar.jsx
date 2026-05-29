import React, { useState, useContext } from "react";
import { AppContext, ADDR_OPTIONS } from "../context/AppContext";
import { ShoppingBag, MapPin, Compass, LogOut, ShoppingBag as CartIcon } from "lucide-react";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const { user, handleLogout, selectedAddress, setSelectedAddress, nearestStore, cart, role, token } = useContext(AppContext);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/30">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            Kart<span className="text-emerald-400 font-extrabold">ly</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded ml-2">
            10-min
          </span>
        </div>

        {/* Address Selection (Only visible for customer) */}
        {token && role === "user" && (
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowAddressDropdown(!showAddressDropdown)}
              className="flex items-center gap-2 text-sm bg-gray-900/60 border border-gray-800 hover:border-emerald-500/30 rounded-full px-4 py-2 text-gray-300 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-semibold text-white max-w-[150px] truncate">{selectedAddress.label}</span>
              <span className="text-gray-500 text-xs">▼</span>
            </button>
            {showAddressDropdown && (
              <div className="absolute top-12 left-0 w-80 glass-panel p-2 rounded-2xl shadow-2xl border border-gray-800 text-left">
                <p className="text-xs text-gray-500 font-bold px-3 py-1.5 uppercase tracking-wider">Select Delivery Location</p>
                {ADDR_OPTIONS.map((addr, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setShowAddressDropdown(false);
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-emerald-500/10 flex items-start gap-3 transition-colors border border-transparent hover:border-emerald-500/20 mb-1"
                  >
                    <MapPin className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{addr.label}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{addr.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {token && role === "user" && nearestStore && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sourcing from <strong>{nearestStore.name}</strong></span>
            </div>
          )}

          {token ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30">
                  {user?.fullname ? user.fullname[0].toUpperCase() : "U"}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-sm font-bold text-white">{user?.fullname || "Quick Shopper"}</p>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{role}</p>
                </div>
              </div>

              {role === "user" && (
                <button
                  onClick={() => setShowCartDrawer(true)}
                  className="relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/25"
                >
                  <CartIcon className="w-5 h-5" />
                  <span>Cart</span>
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-emerald-950 font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-500 shadow-md">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <span className="text-sm font-semibold text-gray-400">Hyperlocal Quick Dispatch</span>
          )}
        </div>
      </div>

      {/* Cart Slider Drawer */}
      {showCartDrawer && <CartDrawer onClose={() => setShowCartDrawer(false)} />}
    </header>
  );
}
