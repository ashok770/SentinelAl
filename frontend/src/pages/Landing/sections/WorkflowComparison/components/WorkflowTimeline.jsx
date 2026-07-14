function WorkflowTimeline({ title, subtitle, steps, accentColor }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0A1022] p-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-semibold text-white">{title}</h3>

        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>

      {/* Timeline */}
      <div className="mt-10">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            {/* Left Side */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={`h-4 w-4 rounded-full ${
                  accentColor === "cyan" ? "bg-cyan-400" : "bg-slate-500"
                }`}
              />

              {/* Connector */}
              {index !== steps.length - 1 && (
                <div className="mt-2 h-14 w-px bg-slate-700" />
              )}
            </div>

            {/* Right Side */}
            <div className="pb-8">
              <h4 className="text-white font-medium">{step.title}</h4>

              <p className="mt-1 text-sm text-slate-400">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkflowTimeline;
