function WorkflowHeader() {
  return (
    <div className="text-center mb-20">
      <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
        Workflow Comparison
      </span>

      <h2 className="mt-6 text-5xl font-bold text-white">
        From Alert to Action
      </h2>

      <p className="mt-6 max-w-3xl mx-auto text-lg leading-8 text-slate-400">
        Security teams spend valuable time jumping between tools, correlating
        evidence, and deciding what to do next. SentinelAI brings everything
        together into one explainable investigation workflow.
      </p>
    </div>
  );
}

export default WorkflowHeader;
