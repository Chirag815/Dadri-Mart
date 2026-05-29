import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress } from "../store/authSlice";
import { MapPin, Save, CheckCircle, Loader2 } from "lucide-react";

const ADDR_OPTIONS = [
  { label: "India Gate (Central Delhi)", text: "Kartavya Path, New Delhi, DL 110001", coords: [77.2295, 28.6129] },
  { label: "Saket City Mall (South Delhi)", text: "Press Enclave Marg, Saket, DL 110017", coords: [77.2185, 28.5286] },
  { label: "Rajendra Place (West Delhi)", text: "Pusa Road, Karol Bagh, DL 110008", coords: [77.1798, 28.6425] },
];

export default function AddressManagementPage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const [selected, setSelected] = useState(null);
  const [customText, setCustomText] = useState("");
  const [customLng, setCustomLng] = useState("");
  const [customLat, setCustomLat] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const savedAddress = user?.address;

  const handleSave = async () => {
    const addressText = selected ? selected.text : customText;
    const coordinates = selected
      ? selected.coords
      : [parseFloat(customLng), parseFloat(customLat)];

    if (!addressText || coordinates.some(isNaN)) return;

    setSaving(true);
    setSavedOk(false);
    try {
      await dispatch(updateAddress({ addressText, coordinates })).unwrap();
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <MapPin className="w-7 h-7 text-emerald-400" />
          <span>Address Management</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Your saved delivery address determines which dark store serves your orders.
        </p>
      </div>

      {/* Current saved address */}
      {savedAddress?.text && (
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 flex items-start gap-4">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 shrink-0">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Currently Saved</p>
            <p className="text-sm font-bold text-white mt-1">{savedAddress.text}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Coordinates: {savedAddress.coordinates[1].toFixed(4)}°N, {savedAddress.coordinates[0].toFixed(4)}°E
            </p>
          </div>
        </div>
      )}

      {/* Quick pick presets */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Quick Select Location</h4>
        <div className="space-y-2">
          {ADDR_OPTIONS.map((addr, i) => (
            <button
              key={i}
              onClick={() => {
                setSelected(selected?.label === addr.label ? null : addr);
                setCustomText("");
                setCustomLng("");
                setCustomLat("");
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                selected?.label === addr.label
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "glass-card border-gray-800 hover:border-gray-700"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                selected?.label === addr.label
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-gray-600"
              }`}>
                {selected?.label === addr.label && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-950"></div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{addr.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{addr.text}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {addr.coords[1]}°N, {addr.coords[0]}°E
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom address entry */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Or Enter Custom Address</h4>
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Full Address Text
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                setSelected(null);
              }}
              placeholder="e.g., A-204, Vasant Kunj, New Delhi - 110070"
              className="w-full glass-input px-4 py-3 rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Longitude
              </label>
              <input
                type="number"
                value={customLng}
                onChange={(e) => { setCustomLng(e.target.value); setSelected(null); }}
                placeholder="77.2090"
                step="0.0001"
                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Latitude
              </label>
              <input
                type="number"
                value={customLat}
                onChange={(e) => { setCustomLat(e.target.value); setSelected(null); }}
                placeholder="28.6139"
                step="0.0001"
                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || (!selected && !customText)}
        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-950 font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 text-sm uppercase tracking-wider cursor-pointer"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving Address...</span>
          </>
        ) : savedOk ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Address Saved!</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Save Delivery Address</span>
          </>
        )}
      </button>
    </div>
  );
}
