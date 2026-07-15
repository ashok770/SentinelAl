export const comparisonMetrics = [
  {
    label: "Investigation Time",
    traditional: "45–90 minutes",
    sentinel: "Under 60 seconds",
  },
  {
    label: "Tools Required",
    traditional: "5–8 separate platforms",
    sentinel: "One unified dashboard",
  },
  {
    label: "False Positive Rate",
    traditional: "High — analyst fatigue",
    sentinel: "Reduced by AI filtering",
  },
  {
    label: "Decision Confidence",
    traditional: "Subjective",
    sentinel: "98.7% AI confidence score",
  },
  {
    label: "Audit Trail",
    traditional: "Manual documentation",
    sentinel: "Auto-generated timeline",
  },
];

function OutcomeHeader() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
        Why SentinelAI
      </span>

      <h2 className="mt-6 text-5xl font-bold text-white">
        Security Teams Don't Need More Tools
      </h2>

      <p className="mt-6 text-lg leading-8 text-slate-400">
        Traditional investigations force analysts to jump between multiple
        platforms before making a decision. SentinelAI brings identity,
        behaviour and risk intelligence into one explainable investigation.
      </p>
    </div>
  );
}

export default OutcomeHeader;
