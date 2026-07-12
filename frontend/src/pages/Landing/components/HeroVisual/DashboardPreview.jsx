import { AlertTriangle, ShieldAlert, ShieldCheck, Monitor } from "lucide-react";
import DashboardHeader from "./components/DashboardHeader";
import DashboardStatus from "./components/DashboardStatus";

function DashboardPreview() {
  return (
    <div className="w-72 rounded-3xl border border-slate-700/50 bg-slate-900/80 p-5 backdrop-blur-xl shadow-2xl">
      <DashboardHeader />
      <DashboardStatus />

      <div className="space-y-3">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-300">
              <ShieldAlert size={18} />
              <span className="text-sm">Critical Users</span>
            </div>

            <span className="text-xl font-bold text-white">2</span>
          </div>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-300">
              <AlertTriangle size={18} />
              <span className="text-sm">High Risk</span>
            </div>

            <span className="text-xl font-bold text-white">5</span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300">
              <ShieldCheck size={18} />
              <span className="text-sm">Low Risk</span>
            </div>

            <span className="text-xl font-bold text-white">420</span>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-700 pt-4">
        <p className="mb-3 text-xs uppercase tracking-wider text-slate-400">
          Recent Alert
        </p>

        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-slate-800 p-2">
            <Monitor size={18} className="text-blue-400" />
          </div>

          <div>
            <p className="font-medium text-white">Rahul</p>

            <p className="text-sm text-slate-400">Unknown Device Login</p>

            <p className="mt-1 text-sm font-semibold text-red-400">
              Risk Score: 94%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPreview;
