import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Loader2,
  ShieldCheck,
  SearchX,
} from "lucide-react";

import { getInvestigation } from "../../services/api.js";
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

const EVIDENCE_TYPE_STYLES = {
  Behaviour: "border-purple-500/30 bg-purple-500/15 text-purple-300",
  Identity: "border-cyan-500/30 bg-cyan-500/15 text-cyan-300",
  Network: "border-blue-500/30 bg-blue-500/15 text-blue-300",
  Device: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  FileActivity: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  ThreatIntel: "border-red-500/30 bg-red-500/15 text-red-300",
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

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
      <dt className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-200">{value || "—"}</dd>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      <p className="mt-3 text-sm">Loading investigation…</p>
    </div>
  );
}

function ErrorState({ title, message }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-red-400" />
      <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">
        {message || "Please try again later."}
      </p>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-16 text-center">
      <SearchX className="h-10 w-10 text-slate-500" />
      <h2 className="mt-4 text-lg font-semibold text-white">
        Investigation not found
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        We could not find an investigation for this ID.
      </p>
      <Link
        to={ROUTES.investigations}
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-500/40 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to investigations
      </Link>
    </div>
  );
}

function InvestigationDetailsPage() {
  const { investigationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const result = await getInvestigation(investigationId);
        if (!active) return;
        if (!result.investigation) {
          setNotFound(true);
        } else {
          setData(result);
        }
      } catch (err) {
        if (active) {
          if (err.status === 404) setNotFound(true);
          else setError(err);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [investigationId]);

  const investigation = data?.investigation;
  const evidence = useMemo(() => {
    const items = Array.isArray(data?.evidence) ? data.evidence : [];
    return [...items].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );
  }, [data]);

  if (loading) return <LoadingState />;
  if (notFound) return <NotFoundState />;
  if (error) {
    return (
      <ErrorState title="Failed to load investigation" message={error.message} />
    );
  }
  if (!data || !investigation) return <LoadingState />;

  return (
    <div>
      <Link
        to={ROUTES.investigations}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to investigations
      </Link>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-mono">{investigation.caseId}</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              {investigation.title}
            </h2>
            {investigation.description ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                {investigation.description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
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
                STATUS_STYLES[investigation.status] || STATUS_STYLES.Open
              }
            >
              {investigation.status}
            </Badge>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Severity" value={investigation.severity} />
          <InfoItem label="Status" value={investigation.status} />
          <InfoItem label="Source" value={investigation.source} />
          <InfoItem label="Created" value={formatDate(investigation.createdAt)} />
          <InfoItem label="Updated" value={formatDate(investigation.updatedAt)} />
        </dl>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Evidence</h3>
          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
            {evidence.length} item{evidence.length === 1 ? "" : "s"}
          </span>
        </div>

        {evidence.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-14 text-center">
            <SearchX className="h-8 w-8 text-slate-600" />
            <p className="mt-3 text-sm text-slate-400">
              No evidence has been collected for this investigation yet.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-4 border-l border-slate-800 pl-5">
            {evidence.map((item) => (
              <li key={item._id} className="relative">
                <span className="absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-cyan-500/40 bg-slate-950">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                </span>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="text-sm font-semibold text-white">
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={
                          EVIDENCE_TYPE_STYLES[item.type] ||
                          "border-slate-600/30 bg-slate-600/15 text-slate-300"
                        }
                      >
                        {item.type}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDateTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                  {item.summary ? (
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {item.summary}
                    </p>
                  ) : null}
                  {typeof item.confidence === "number" ? (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs font-medium text-cyan-300">
                        {item.confidence}% confidence
                      </span>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export default InvestigationDetailsPage;