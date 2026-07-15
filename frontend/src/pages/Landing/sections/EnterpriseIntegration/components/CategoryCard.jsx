import LogoBadge from "./LogoBadge";

function CategoryCard({ title, description, tools }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0A1022] p-8 transition-all duration-300 hover:border-cyan-500/30">
      {/* Category Header */}
      <div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
      </div>

      {/* Supported Tools */}
      <div className="mt-8 flex flex-wrap gap-3">
        {tools.map((tool, index) => (
          <LogoBadge key={index} name={tool} />
        ))}
      </div>
    </div>
  );
}

export default CategoryCard;
