function CTAContent() {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
        Get Started
      </span>

      <h2 className="mt-8 text-5xl font-bold leading-tight text-white">
        Ready to Investigate Smarter?
      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
        Discover how SentinelAI helps security teams investigate alerts faster
        with explainable AI-powered decisions while keeping analysts in complete
        control.
      </p>

      <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <button className="rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-slate-950 transition-all duration-300 hover:bg-cyan-400">
          Request Demo
        </button>

        <button className="rounded-xl border border-slate-700 px-8 py-4 font-semibold text-white transition-all duration-300 hover:border-cyan-500 hover:text-cyan-300">
          Join Early Access
        </button>
      </div>
    </div>
  );
}

export default CTAContent;
