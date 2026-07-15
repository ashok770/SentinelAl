function MetricRow({ label, traditional, sentinel }) {
  return (
    <div className="border-b border-slate-800 py-8">
      <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <div className="grid grid-cols-3 items-center">
        <div className="text-center">
          <p className="text-3xl font-bold text-slate-300">{traditional}</p>

          <p className="mt-2 text-sm text-slate-500">Traditional</p>
        </div>

        <div className="text-center">
          <span className="text-3xl text-slate-600">→</span>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-cyan-400">{sentinel}</p>

          <p className="mt-2 text-sm text-cyan-300">SentinelAI</p>
        </div>
      </div>
    </div>
  );
}

export default MetricRow;
