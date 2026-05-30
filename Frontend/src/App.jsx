import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AppProvider, AppContext } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SimulationDashboard from "./components/SimulationDashboard";

// Pages
import CustomerPortal from "./pages/CustomerPortal";
import CustomerProfile from "./pages/CustomerProfile";
import AuthPortal from "./pages/AuthPortal";
import VendorPortal from "./pages/VendorPortal";
import AdminPortal from "./pages/AdminPortal";
import AdminLogin from "./pages/AdminLogin";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}

function AppShell() {
    const { token, role, loading } = useContext(AppContext);
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-radial">
          <div className="text-2xl font-bold text-emerald-500 animate-pulse">Loading...</div>
        </div>
      );
    }
  return (
    <div className="min-h-screen flex flex-col bg-gradient-radial">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 animate-slide-in">
        <Routes>
          {/* ── Hidden Admin Login Route (not linked anywhere in the UI) ── */}
          <Route path="/admin-login" element={<AdminLoginRoute />} />

          <Route path="/profile" element={token && role === "user" ? <CustomerProfile /> : <Navigate to="/" replace />} />
          {/* ── All other routes go through role-based portal router ── */}
          <Route path="/*" element={<PortalRouter />} />
        </Routes>
      </main>
      <SimulationDashboard />
      <Footer />
    </div>
  );
}

/**
 * AdminLoginRoute: Shows AdminLogin form when not authenticated as admin.
 * If already logged in as admin, redirect to home (which shows AdminPortal).
 */
function AdminLoginRoute() {
  const { token, role } = useContext(AppContext);

  if (token && role === "admin") {
    return <Navigate to="/" replace />;
  }

  return <AdminLogin />;
}

/**
 * PortalRouter: Routes authenticated users to their role-specific portal.
 * Unauthenticated users always see AuthPortal (customer/vendor login).
 */
function PortalRouter() {
  const { token, role } = useContext(AppContext);

  if (!token) {
    return <AuthPortal />;
  }

  switch (role) {
    case "admin":
      return <AdminPortal />;
    case "vendor":
      return <VendorPortal />;
    case "user":
    default:
      return <CustomerPortal />;
  }
}
