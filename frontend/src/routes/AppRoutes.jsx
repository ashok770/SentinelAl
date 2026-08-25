import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Landing from "../pages/Landing/Landing";
import Dashboard from "../pages/Dashboard/Dashboard";
import InvestigationsPage from "../pages/Investigations/InvestigationsPage";
import InvestigationDetailsPage from "../pages/Investigations/InvestigationDetailsPage";

import { ROUTES } from "../constants/routes.js";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.landing} element={<Landing />} />
        </Route>

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.dashboard} element={<Dashboard />} />
          <Route path={ROUTES.investigations} element={<InvestigationsPage />} />
          <Route
            path={`${ROUTES.investigations}/:investigationId`}
            element={<InvestigationDetailsPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
