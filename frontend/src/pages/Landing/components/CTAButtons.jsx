function CTAButtons() {
  return (
    <div className="flex items-center gap-5">
      <a
        href="#contact"
        className="rounded-xl bg-blue-500 px-7 py-4 font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
      >
        Get Started
      </a>

      <a
        href="#how-it-works"
        className="rounded-xl border border-slate-700 bg-slate-900/60 px-7 py-4 font-medium text-white transition hover:border-slate-500"
      >
        Watch Demo
      </a>
    </div>
  );
}

export default CTAButtons;
