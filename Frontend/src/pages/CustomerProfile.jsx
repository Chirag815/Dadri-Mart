import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import AddressManagementPage from "./AddressManagementPage";
import { User, Mail, Phone, MapPin, Edit2 } from "lucide-react";

export default function CustomerProfile() {
  const { user } = useContext(AppContext);

  if (!user) {
    return <p className="text-center text-gray-400">Loading profile...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 animate-slide-in">
      <h2 className="text-3xl font-black text-white flex items-center gap-2">
        <User className="w-6 h-6 text-emerald-400" />
        Customer Profile
      </h2>

      <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 uppercase font-bold">Name</p>
            <p className="text-lg font-semibold text-white">{user.fullname || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-bold">Email</p>
            <p className="text-lg font-semibold text-white">{user.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-bold">Phone</p>
            <p className="text-lg font-semibold text-white">{user.phone || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-bold">Pincode</p>
            <p className="text-lg font-semibold text-white">{user.pincode || "—"}</p>
          </div>
        </div>
      </div>

      {/* Reuse address management UI for editing */}
      <AddressManagementPage />
    </div>
  );
}
