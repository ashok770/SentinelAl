import { CheckCircle2, AlertTriangle } from "lucide-react";

function TimelineStep({
  icon,
  time,
  title,
  description,
  status,
  isLast = false,
}) {
  const isCritical = status === "critical";

  return (
    <div className="relative flex gap-5">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full border
          ${
            isCritical
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
          }`}
        >
          {icon}
        </div>

        {!isLast && <div className="mt-2 h-16 w-px bg-slate-700" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500">{time}</p>

            <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
          </div>

          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium
            ${
              isCritical
                ? "bg-red-500/10 text-red-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {isCritical ? (
              <AlertTriangle size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}

            {isCritical ? "Critical" : "Completed"}
          </div>
        </div>

        <p className="mt-3 max-w-xl leading-7 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

export default TimelineStep;
