import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { ShoppingBag, X, CheckCircle, Minus, Plus, CreditCard } from "lucide-react";

export default function CartDrawer({ onClose }) {
  const { cart, removeFromCart, addToCart, handleCheckout } = useContext(AppContext);
  const [checkingOut, setCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 25;
  const total = subtotal + deliveryFee;

  const triggerCheckout = async () => {
    setCheckingOut(true);
    // Simulate Card Authorization screen delay
    setTimeout(async () => {
      const res = await handleCheckout();
      setCheckingOut(false);
      if (res?.success) {
        setSuccess(true);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      {/* Tap out spacer */}
      <div className="flex-1" onClick={onClose}></div>
      
      {/* Sliding Content Drawer */}
      <div className="w-full max-w-md h-full bg-[#0D111A] border-l border-gray-800 p-6 flex flex-col justify-between shadow-2xl relative">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white">Your Cart Bag</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Items Body */}
        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-slide-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">Order Confirmed!</h2>
            <p className="text-xs text-gray-400 max-w-[250px] leading-relaxed">
              We have locked inventory in the nearest store. Packers are starting picking list. Watch live tracking on customer home page!
            </p>
            <button
              onClick={onClose}
              className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-xs uppercase px-6 py-2.5 rounded-xl cursor-pointer shadow-md mt-6"
            >
              Track Order
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <ShoppingBag className="w-12 h-12 text-gray-600" />
            <h4 className="font-bold text-white">Cart is Empty</h4>
            <p className="text-xs text-gray-500">Add fresh milk, organic veggies and snacks to check out!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 divide-y divide-gray-900 space-y-4">
            {cart.map((item) => (
              <div key={item.product._id} className="flex items-start gap-4 py-3">
                <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded-xl bg-gray-950 border border-gray-900 shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{item.product.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">₹{item.product.price} / item</p>
                  
                  {/* Quantity adjustments */}
                  <div className="flex items-center gap-3 bg-gray-950/80 border border-gray-800 rounded-lg px-2 py-1 w-fit mt-2">
                    <button onClick={() => removeFromCart(item.product._id)} className="text-gray-400 hover:text-emerald-400 p-0.5"><Minus className="w-3 h-3" /></button>
                    <span className="text-white font-extrabold text-xs min-w-[12px] text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item.product)} className="text-gray-400 hover:text-emerald-400 p-0.5" disabled={item.quantity >= item.product.stock}><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-sm text-emerald-400">₹{item.product.price * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drawer Bottom Pricing Card */}
        {!success && cart.length > 0 && (
          <div className="border-t border-gray-800 pt-4 space-y-4 shrink-0">
            <div className="space-y-2 text-sm text-gray-400 text-left">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-white">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Logistics Fee</span>
                <span className="font-bold text-white">
                  {deliveryFee === 0 ? <span className="text-emerald-400 font-extrabold uppercase text-[10px]">Free</span> : `₹${deliveryFee}`}
                </span>
              </div>
              {subtotal < 500 && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-lg text-[10px] text-emerald-400 font-medium">
                  💡 Shop for <strong>₹{500 - subtotal}</strong> more to unlock FREE delivery!
                </div>
              )}
              <div className="flex items-center justify-between border-t border-gray-900 pt-2 text-base font-extrabold text-white">
                <span>Order Total</span>
                <span className="text-emerald-400 text-lg">₹{total}</span>
              </div>
            </div>

            <button
              onClick={triggerCheckout}
              disabled={checkingOut}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-950 font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 text-sm flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              {checkingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Authorizing Card...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Simulate Payment & Order</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
