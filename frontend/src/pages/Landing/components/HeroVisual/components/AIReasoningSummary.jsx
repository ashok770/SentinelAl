import { CheckCircle2 } from "lucide-react";

const signals = [
  "Identity Verified",
  "Unknown Device",
  "Behaviour Anomaly",
  "Threat Intel Match",
];

function AIReasoningSummary() {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
        AI Reasoning
      </p>

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {signals.map((signal, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <CheckCircle2 size={11} className="text-cyan-400 shrink-0" />
            <span className="text-[11px] text-slate-300">{signal}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
        <div className="text-center">
          <p className="text-[10px] text-slate-500">AI Confidence</p>
          <p className="text-sm font-bold text-cyan-400">98.7%</p>
        </div>
        <div className="h-6 w-px bg-slate-700" />
        <div className="text-center">
          <p className="text-[10px] text-slate-500">Risk Score</p>
          <p className="text-sm font-bold text-red-400">94 / 100</p>
        </div>
      </div>
    </div>
  );
}

export default AIReasoningSummary;
