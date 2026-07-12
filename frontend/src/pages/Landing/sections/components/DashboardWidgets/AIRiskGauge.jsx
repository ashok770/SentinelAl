function AIRiskGauge() {
  const score = 94;

  return (
    <div className="h-full rounded-3xl border border-slate-800 bg-[#0A1022] p-6">
      <h3 className="text-xl font-semibold text-white">AI Risk Score</h3>

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

            <span className="text-red-400">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIRiskGauge;
