function WorkflowColumn({ title, subtitle, steps, accent }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0A1022] p-8">
      <h3 className="text-2xl font-semibold text-white">{title}</h3>

      <p className="mt-2 text-sm text-slate-400">{subtitle}</p>

      <div className="mt-10 space-y-5">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            {/* Circle */}
            <div
              className={`mt-1 h-4 w-4 rounded-full ${
                accent === "cyan" ? "bg-cyan-400" : "bg-slate-500"
              }`}
            />

            {/* Text */}
            <div className="flex-1">
              <p className="text-slate-200">{step}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkflowColumn;
