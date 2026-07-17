import { LogIn, Monitor, Activity, Shield, CheckCircle2 } from "lucide-react";

const events = [
  { time: "09:42", icon: LogIn,        label: "Login Attempt",       color: "text-cyan-400",   border: "border-cyan-500/30",   bg: "bg-cyan-500/10"   },
  { time: "09:42", icon: Monitor,      label: "Device Verification", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
  { time: "09:43", icon: Activity,     label: "Behaviour Analysis",  color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10" },
  { time: "09:43", icon: Shield,       label: "Threat Intelligence", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  { time: "09:44", icon: CheckCircle2, label: "Decision Generated",  color: "text-red-400",    border: "border-red-500/30",    bg: "bg-red-500/10"    },
];

function EvidenceTimeline() {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
        Evidence Timeline
      </p>
      <div className="space-y-0">
        {events.map(({ time, icon: Icon, label, color, border, bg }, i) => (
          <div key={i} className="flex gap-3">
            {/* spine */}
            <div className="flex flex-col items-center">
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${border} ${bg}`}>
                <Icon size={10} className={color} />
              </div>
              {i < events.length - 1 && (
                <div className="w-px flex-1 bg-slate-700/50 my-0.5" style={{ minHeight: "12px" }} />
              )}
            </div>
            {/* content */}
            <div className="pb-2">
              <p className="text-[11px] text-slate-300 font-medium leading-none mt-1">{label}</p>
              <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvidenceTimeline;
