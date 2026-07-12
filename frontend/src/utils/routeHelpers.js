import { ROUTES } from "../constants/routes.js";

export function getDashboardRoutes() {
  return [
    { path: ROUTES.dashboard, label: "Dashboard" },
    { path: ROUTES.users, label: "Users" },
    { path: ROUTES.alerts, label: "Alerts" },
    { path: ROUTES.investigations, label: "Investigations" },
    { path: ROUTES.analytics, label: "Analytics" },
    { path: ROUTES.settings, label: "Settings" },
  ];
}
