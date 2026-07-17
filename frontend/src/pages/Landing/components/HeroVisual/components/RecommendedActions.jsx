import { ShieldCheck, Lock, Bell } from "lucide-react";

const actions = [
  { label: "Require MFA",   icon: ShieldCheck, priority: "P1", color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20"    },
  { label: "Lock Session",  icon: Lock,        priority: "P2", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { label: "Notify SOC",   icon: Bell,        priority: "P2", color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20"   },
];

function RecommendedActions() {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
        Recommended Actions
      </p>
      <div className="space-y-1.5">
        {actions.map(({ label, icon: Icon, priority, color, bg, border }, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-xl border ${border} ${bg} px-3 py-2`}
          >
            <div className="flex items-center gap-2">
              <Icon size={12} className={color} />
              <span className="text-[11px] text-slate-200 font-medium">{label}</span>
            </div>
            <span className={`text-[10px] font-bold ${color}`}>{priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedActions;
