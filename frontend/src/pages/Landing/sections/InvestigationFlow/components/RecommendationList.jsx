import { ShieldCheck, Lock, Bell, KeyRound } from "lucide-react";

import { recommendations } from "../data/investigationData";

const iconMap = {
  "Require Multi-Factor Authentication": <ShieldCheck size={18} />,
  "Lock Suspicious Session": <Lock size={18} />,
  "Notify Security Team": <Bell size={18} />,
  "Force Password Reset": <KeyRound size={18} />,
};

const badgeColor = {
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
};

function RecommendationList() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0A1022] p-8">
      <h3 className="text-2xl font-semibold text-white mb-8">
        Recommended Response
      </h3>

      <div className="space-y-4">
        {recommendations.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-4 transition hover:border-cyan-500/30"
          >
            <div className="flex items-center gap-4">
              <div className="text-cyan-400">{iconMap[item.action]}</div>

              <span className="text-slate-200">{item.action}</span>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${badgeColor[item.color]}`}
            >
              {item.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendationList;
