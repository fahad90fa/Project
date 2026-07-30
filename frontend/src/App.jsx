import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import NewScanPage from "./pages/dashboard/NewScanPage.jsx";
import ScanHistoryPage from "./pages/dashboard/ScanHistoryPage.jsx";
import AssetInventoryPage from "./pages/dashboard/AssetInventoryPage.jsx";
import ProfilePage from "./pages/dashboard/ProfilePage.jsx";
import SettingsPage from "./pages/dashboard/SettingsPage.jsx";
import ReportsPage from "./pages/dashboard/ReportsPage.jsx";
import SchedulePage from "./pages/dashboard/SchedulePage.jsx";
import ComparePage from "./pages/dashboard/ComparePage.jsx";

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="app-shell">
      {!isDashboard && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="scan" element={<NewScanPage />} />
          <Route path="history" element={<ScanHistoryPage />} />
          <Route path="assets" element={<AssetInventoryPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!isDashboard && <Footer />}
    </div>
  );
}
