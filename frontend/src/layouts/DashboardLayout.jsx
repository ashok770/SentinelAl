import { useState, useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import {
  Activity,
  BarChart3,
  Bell,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
  LogOut,
} from "lucide-react";

import { ROUTES } from "../constants/routes.js";

const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: "Overview", icon: LayoutDashboard },
  { to: ROUTES.investigations, label: "Investigations", icon: ShieldCheck },
  { to: ROUTES.alerts, label: "Alerts", icon: Bell },
  { to: ROUTES.analytics, label: "Analytics", icon: BarChart3 },
  { to: ROUTES.users, label: "Users", icon: Users },
  { to: ROUTES.settings, label: "Settings", icon: Settings },
];

const navLinkClass = ({ isActive }) =>
  `group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
    isActive
      ? "bg-cyan-500/10 text-cyan-400"
      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
  }`;

function SidebarContent() {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Activity className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold text-slate-100 tracking-wide">Sentinel<span className="text-cyan-400">AI</span></p>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Security Ops</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClass}>
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 py-4 border-t border-slate-800/60">
        <div className="flex items-center gap-3 rounded-md p-2 bg-slate-950/50 border border-slate-800/50">
          <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center text-slate-300 font-medium text-sm border border-slate-700">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'Analyst'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'SOC Team'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth?mode=login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-800/60 bg-slate-900/95 backdrop-blur-md lg:block shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900 shadow-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="min-h-screen lg:pl-64">
        {/* Top / header area */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-4 py-3 backdrop-blur-md lg:px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-slate-950"></span>
            </button>
            <div className="h-5 w-px bg-slate-800 mx-1"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-100 hover:bg-slate-800/50"
              aria-label="Log out"
            >
              <span className="hidden sm:inline">Sign out</span>
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
