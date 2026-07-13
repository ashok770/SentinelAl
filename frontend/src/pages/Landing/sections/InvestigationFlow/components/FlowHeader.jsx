function FlowHeader() {
  return (
    <div className="text-center mb-16">
      <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
        AI Investigation Engine
      </span>

      <h2 className="mt-6 text-5xl font-bold text-white">
        How SentinelAI Thinks
      </h2>

      <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-400 leading-8">
        Every security alert follows a transparent investigation pipeline.
        SentinelAI collects evidence, correlates behaviour, calculates risk, and
        recommends the next action before analysts make their decision.
      </p>
    </div>
  );
}

export default FlowHeader;
