import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight, Inbox, Loader2 } from "lucide-react";

import { getInvestigations } from "../../services/api.js";
import { ROUTES } from "../../constants/routes.js";

const SEVERITY_STYLES = {
  Critical: "border-red-500/30 bg-red-500/15 text-red-400",
  High: "border-orange-500/30 bg-orange-500/15 text-orange-400",
  Medium: "border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  Low: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
};

const STATUS_STYLES = {
  Open: "border-slate-500/30 bg-slate-500/15 text-slate-300",
  Investigating: "border-cyan-500/30 bg-cyan-500/15 text-cyan-400",
  Resolved: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  Closed: "border-slate-600/30 bg-slate-600/15 text-slate-400",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      <p className="mt-3 text-sm">Loading investigations…</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-red-400" />
      <h2 className="mt-4 text-lg font-semibold text-white">
        Failed to load investigations
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        {message || "An unexpected error occurred."}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-20 text-center">
      <Inbox className="h-10 w-10 text-slate-600" />
      <h2 className="mt-4 text-lg font-semibold text-white">
        No investigations yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        New security investigations will appear here as they are created.
      </p>
    </div>
  );
}

function InvestigationsPage() {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getInvestigations();
        if (active) setInvestigations(data || []);
      } catch (err) {
        if (active) setError(err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (investigations.length === 0) return <EmptyState />;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Investigations
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Review the current investigation queue.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
          {investigations.length} total
        </span>
      </div>

      <ul className="space-y-3">
        {investigations.map((investigation) => (
          <li key={investigation._id}>
            <Link
              to={`${ROUTES.investigations}/${investigation._id}`}
              className="group block rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-cyan-500/40 hover:bg-slate-900"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <span className="font-mono text-xs text-slate-500">
                    {investigation.caseId}
                  </span>
                  <h3 className="mt-1 truncate text-sm font-semibold text-white group-hover:text-cyan-300">
                    {investigation.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={
                      SEVERITY_STYLES[investigation.severity] ||
                      SEVERITY_STYLES.Medium
                    }
                  >
                    {investigation.severity}
                  </Badge>
                  <Badge
                    className={
                      STATUS_STYLES[investigation.status] ||
                      STATUS_STYLES.Open
                    }
                  >
                    {investigation.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
                <span>Source: {investigation.source || "—"}</span>
                <div className="flex shrink-0 items-center gap-3">
                  <span>{formatDate(investigation.createdAt)}</span>
                  <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-400" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InvestigationsPage;