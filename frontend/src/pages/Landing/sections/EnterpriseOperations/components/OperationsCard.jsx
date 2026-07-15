import WorkflowMini from "./WorkflowMini";

function OperationsCard({ title, description, type, workflow, items }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0A1022] p-8 transition-all duration-300 hover:border-cyan-500/30">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
      </div>

      {/* Workflow Card */}
      {type === "workflow" && <WorkflowMini steps={workflow} />}

      {/* Deployment / Enterprise */}
      {(type === "deployment" || type === "enterprise") && (
        <div className="mt-8 space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3"
            >
              <p className="text-sm font-medium text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OperationsCard;
