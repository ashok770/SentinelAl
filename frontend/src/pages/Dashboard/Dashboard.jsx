import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { ROUTES } from "../../constants/routes.js";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
        <ShieldCheck className="h-8 w-8 text-white" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Investigation Console
      </h1>

      <p className="mt-4 max-w-xl text-slate-400">
        Review, triage, and manage security investigations directly from
        SentinelAI. Start by exploring the investigation queue.
      </p>

      <button
        type="button"
        onClick={() => navigate(ROUTES.investigations)}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-colors hover:bg-cyan-400"
      >
        View Investigations
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default Dashboard;
