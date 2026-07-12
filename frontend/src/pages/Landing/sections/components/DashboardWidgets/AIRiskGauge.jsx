import { ShieldAlert, Brain, Lock, Bell, KeyRound } from "lucide-react";
import { dashboardData } from "../../../data/dashboardData";

function AIRiskGauge() {
  const score = dashboardData.riskScore;

  return (
    <div className="h-full rounded-3xl border border-slate-800 bg-[#0A1022] p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">AI Risk Score</h3>

        <div className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
          LIVE
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <div className="relative w-44 h-44">
          <svg className="-rotate-90" width="176" height="176">
            <circle
              cx="88"
              cy="88"
              r="72"
              stroke="#1E293B"
              strokeWidth="12"
              fill="transparent"
            />

            <circle
              cx="88"
              cy="88"
              r="72"
              stroke="#3B82F6"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray="452"
              strokeDashoffset={452 - (452 * score) / 100}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h2 className="text-4xl font-bold text-white">{score}%</h2>

            <span className="text-red-400">{dashboardData.threatLevel}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-400">
            <Brain size={16} />
            AI Confidence
          </span>

          <span className="font-semibold text-cyan-400">{dashboardData.aiConfidence}%</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-400">
            <ShieldAlert size={16} />
            Threat Level
          </span>

          <span className="font-semibold text-red-400">{dashboardData.threatLevel}</span>
        </div>
      </div>

      <div className="my-6 h-px bg-slate-800" />

      <div>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Recommended Actions
        </h4>

        <div className="space-y-3">
          {dashboardData.recommendations.map((item, index) => {
            const icons = [
              <KeyRound size={16} className="text-cyan-400" />,
              <Lock size={16} className="text-yellow-400" />,
              <Bell size={16} className="text-red-400" />,
            ];
            return (
              <div key={index} className="flex items-center gap-3">
                {icons[index]}
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AIRiskGauge;
