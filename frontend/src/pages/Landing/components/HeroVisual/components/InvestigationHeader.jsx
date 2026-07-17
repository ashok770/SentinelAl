function InvestigationHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
        <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
          Live Investigation
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] text-slate-500 font-mono">
          Case <span className="text-cyan-400">#4821</span>
        </span>
        <span className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
          Investigating
        </span>
      </div>
    </div>
  );
}

export default InvestigationHeader;
