import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { Users, Shield, Truck, User, Search, Loader2 } from "lucide-react";

function useAllUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await api.get("/auth/users");
      return res.data.data;
    },
    staleTime: 30_000,
    retry: 1,
  });
}

const ROLE_CONFIG = {
  user:  { label: "Customer",    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",   icon: User },
  admin: { label: "Store Admin", color: "text-violet-400 bg-violet-500/10 border-violet-500/20", icon: Shield },
  rider: { label: "Rider",       color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Truck },
};

// Simulated users for when backend doesn't yet expose /auth/users
const DEMO_USERS = [
  { _id: "u1", username: "alex_shopper", email: "alex@kartly.io", fullname: "Alex Carter", role: "user",  createdAt: new Date().toISOString() },
  { _id: "u2", username: "store_admin",  email: "admin@kartly.io", fullname: "Ananya Singh", role: "admin", createdAt: new Date().toISOString() },
  { _id: "u3", username: "rider_rohit",  email: "rohit@kartly.io", fullname: "Rohit Mehra", role: "rider", createdAt: new Date().toISOString() },
  { _id: "u4", username: "rider_priya",  email: "priya@kartly.io", fullname: "Priya Sharma", role: "rider", createdAt: new Date().toISOString() },
];

export default function UserManagementPage() {
  const { data, isLoading, isError } = useAllUsers();
  const users = (isError || !data) ? DEMO_USERS : data;
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.fullname?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const counts = { user: 0, admin: 0, rider: 0 };
  users.forEach((u) => { if (counts[u.role] !== undefined) counts[u.role]++; });

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-violet-400" />
            <span>User Management</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {users.length} registered accounts across all roles
          </p>
        </div>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {["user", "admin", "rider"].map((r) => {
          const cfg = ROLE_CONFIG[r];
          const RoleIcon = cfg.icon;
          return (
            <div key={r} className={`glass-card p-4 rounded-2xl border ${cfg.color.split(" ").slice(1).join(" ")} text-left`}>
              <RoleIcon className={`w-5 h-5 mb-2 ${cfg.color.split(" ")[0]}`} />
              <p className="text-2xl font-black text-white">{counts[r]}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">{cfg.label}s</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
          />
        </div>
        <div className="flex gap-2 bg-gray-900/60 p-1 rounded-xl border border-gray-800 shrink-0">
          {["all", "user", "admin", "rider"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
                roleFilter === r
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading users...</span>
        </div>
      )}

      {isError && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 shrink-0" />
          <span>Backend user list endpoint not yet exposed. Showing demo data. Add <code className="text-xs bg-amber-500/10 px-1 rounded">GET /api/auth/users</code> to backend to enable live data.</span>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-900 bg-gray-950/40 text-gray-500 uppercase tracking-widest text-[9px] font-black">
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-5">Username</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {filtered.map((u) => {
                const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
                const RoleIcon = cfg.icon;
                return (
                  <tr key={u._id} className="hover:bg-gray-900/20 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 font-extrabold flex items-center justify-center border border-violet-500/20 text-sm shrink-0">
                          {u.fullname?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="font-bold text-white truncate">{u.fullname || "—"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-gray-400">{u.username}</td>
                    <td className="py-4 px-5 text-gray-400 truncate max-w-[180px]">{u.email}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${cfg.color}`}>
                        <RoleIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !isLoading && (
          <div className="py-12 text-center space-y-2">
            <Users className="w-10 h-10 text-gray-700 mx-auto" />
            <p className="text-sm font-bold text-white">No users match the filter</p>
            <p className="text-xs text-gray-500">Try adjusting your search or role filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
