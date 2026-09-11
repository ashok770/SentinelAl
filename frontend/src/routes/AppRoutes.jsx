import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import RequireAuth from "../components/auth/RequireAuth";

import Landing from "../pages/Landing/Landing";
import AuthPage from "../pages/Auth/AuthPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import InvestigationsPage from "../pages/Investigations/InvestigationsPage";
import InvestigationDetailsPage from "../pages/Investigations/InvestigationDetailsPage";
import AlertsPage from "../pages/Alerts/AlertsPage";
import AnalyticsPage from "../pages/Analytics/AnalyticsPage";
import UsersPage from "../pages/Users/UsersPage";
import SettingsPage from "../pages/Settings/SettingsPage";

import { ROUTES } from "../constants/routes.js";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.landing} element={<Landing />} />
          <Route path={ROUTES.auth} element={<AuthPage />} />
        </Route>

        {/* Protected Application Routes */}
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.dashboard} element={<Dashboard />} />
            <Route path={ROUTES.investigations} element={<InvestigationsPage />} />
            <Route
              path={`${ROUTES.investigations}/:investigationId`}
              element={<InvestigationDetailsPage />}
            />
            <Route path={ROUTES.alerts} element={<AlertsPage />} />
            <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
            <Route path={ROUTES.users} element={<UsersPage />} />
            <Route path={ROUTES.settings} element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
