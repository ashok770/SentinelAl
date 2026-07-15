function LogoBadge({ name }) {
  return (
    <div
      className="
        inline-flex
        items-center
        justify-center
        rounded-xl
        border
        border-slate-700
        bg-slate-900/60
        px-4
        py-3
        transition-all
        duration-300
        hover:border-cyan-500/40
        hover:bg-cyan-500/5
      "
    >
      <span className="text-sm font-medium text-slate-300">{name}</span>
    </div>
  );
}

export default LogoBadge;
