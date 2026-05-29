import React, { useContext } from "react";
import { AppProvider, AppContext } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SimulationDashboard from "./components/SimulationDashboard";
import AuthPortal from "./pages/AuthPortal";
import CustomerPortal from "./pages/CustomerPortal";
import AdminPortal from "./pages/AdminPortal";
import RiderPortal from "./pages/RiderPortal";

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-gradient-radial">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 animate-slide-in">
          <PortalRouter />
        </main>
        <SimulationDashboard />
        <Footer />
      </div>
    </AppProvider>
  );
}

function PortalRouter() {
  const { token, role } = useContext(AppContext);

  if (!token) {
    return <AuthPortal />;
  }

  switch (role) {
    case "admin":
      return <AdminPortal />;
    case "rider":
      return <RiderPortal />;
    case "user":
    default:
      return <CustomerPortal />;
  }
}
