import { MapPin, User, Clock } from "lucide-react";

function ActiveIncidentCard() {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-1">
            Active Incident
          </p>
          <h3 className="text-sm font-bold text-white leading-snug">
            Impossible Travel Detected
          </h3>
        </div>
        <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-400 shrink-0">
          HIGH
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <User size={11} className="text-slate-500" />
          <span>Rahul P.</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <MapPin size={11} className="text-slate-500" />
          <span>
            Mumbai{" "}
            <span className="text-red-400 font-medium">→</span>{" "}
            London
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Clock size={11} />
          <span>09:44 AM · Today</span>
        </div>
      </div>
    </div>
  );
}

export default ActiveIncidentCard;
