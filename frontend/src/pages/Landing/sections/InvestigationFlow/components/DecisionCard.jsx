import { ShieldAlert, Brain, Target, CheckCircle2 } from "lucide-react";
import { decisionData } from "../data/investigationData";
import RecommendationList from "./RecommendationList";

function DecisionCard() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0A1022] px-6 py-5 h-full">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-white">AI Decision</h3>

        <div className="rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-medium text-red-400">
          {decisionData.risk}
        </div>
      </div>

      {/* Decision */}

      <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 py-3 px-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-red-400" size={30} />

          <div>
            <p className="text-white text-xl font-semibold">
              {decisionData.title}
            </p>

            <p className="text-slate-400 mt-1">{decisionData.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Metrics */}

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-400">
            <Brain size={18} />
            AI Confidence
          </div>

          <span className="text-cyan-400 font-semibold">
            {decisionData.confidence}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-400">
            <Target size={18} />
            Risk Score
          </div>

          <span className="text-red-400 font-semibold">
            {decisionData.score}
          </span>
        </div>
      </div>

      {/* Divider */}

      <div className="my-4 h-px bg-slate-800" />

      {/* Explanation */}

      <div>
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-4">
          Why this decision?
        </h4>

        <div className="space-y-2">
          {decisionData.reasons.map((reason, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-cyan-400 mt-0.5" />
              <p className="text-slate-300 text-sm">{reason}</p>
            </div>
          ))}
        </div>
      </div>

      <RecommendationList />
    </div>
  );
}

export default DecisionCard;
