import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Building,
  Briefcase,
  Mail,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Flame,
  BarChart2,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  Activity,
  Layers
} from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { ALERT_STATUS } from '../../../constants/alert.constants.js';
import { ROUTES } from '../../../constants/routes.js';

export function AlertDetailDrawer({
  alert,
  onClose,
  onStatusChange,
  statusLoading = false,
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!alert) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(alert.alertId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigateInvestigation = () => {
    onClose();
    navigate(`${ROUTES.investigations}/${alert.alertId}`);
  };

  // Dimensions
  const dimensions = [
    { label: 'New Device', count: alert.newDeviceDays || 0, icon: Activity },
    { label: 'After-Hours', count: alert.afterHoursDays || 0, icon: Clock },
    { label: 'File Bursts', count: alert.fileBurstDays || 0, icon: FolderOpen },
    { label: 'Device-to-File Seq', count: alert.deviceFileSequenceDays || 0, icon: Layers },
    { label: 'Weekend Activity', count: alert.weekendActivityDays || 0, icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-800/80 bg-slate-950/60 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Investigation Episode
                </span>
                <SeverityBadge severity={alert.severity} />
                <StatusBadge status={alert.status} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-lg font-mono font-bold text-slate-100">{alert.alertId}</h2>
                <button
                  onClick={handleCopyId}
                  title="Copy Alert ID"
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Identity Profile Section */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                    {alert.employeeName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm">{alert.employeeName || alert.userId}</h3>
                    <p className="text-xs font-mono text-cyan-400">{alert.userId}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {alert.businessUnit || 'Enterprise'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Briefcase className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-200 truncate">{alert.role || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-200 truncate">{alert.department || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-200 truncate">{alert.email || `${alert.userId}@company.internal`}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-200 truncate">Supervisor: {alert.supervisor || 'Self'}</span>
                </div>
              </div>
            </div>

            {/* Anomaly Score Matrix */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Calibrated Anomaly Scores
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Peak Anomaly Score</span>
                    <Flame className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-red-400">
                      {typeof alert.peakScore === 'number' ? alert.peakScore.toFixed(1) : alert.peakScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: `${Math.min(alert.peakScore || 0, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Mean Anomaly Score</span>
                    <BarChart2 className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-amber-400">
                      {typeof alert.meanScore === 'number' ? alert.meanScore.toFixed(1) : alert.meanScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${Math.min(alert.meanScore || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Component Detectors */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="px-3 py-2 rounded bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Statistical Peak:</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {typeof alert.statisticalScorePeak === 'number' ? alert.statisticalScorePeak.toFixed(1) : alert.statisticalScorePeak ?? '—'}
                  </span>
                </div>
                <div className="px-3 py-2 rounded bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Isolation Forest Peak:</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {typeof alert.isolationForestScorePeak === 'number' ? alert.isolationForestScorePeak.toFixed(1) : alert.isolationForestScorePeak ?? '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Telemetry Timeline Card */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Episode Telemetry Window
              </h4>
              <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">First Seen</span>
                  <span className="font-medium text-slate-200">
                    {alert.firstSeen ? new Date(alert.firstSeen).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Last Seen</span>
                  <span className="font-medium text-slate-200">
                    {alert.lastSeen ? new Date(alert.lastSeen).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Duration</span>
                  <span className="font-medium text-slate-200">{alert.durationDays} day(s)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Anomalous Days</span>
                  <span className="font-medium text-red-400 font-mono">{alert.anomalousDays}</span>
                </div>
              </div>
            </div>

            {/* Behavioral Summary */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Behavioral Activity Summary
              </h4>
              <div className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/30 text-xs text-slate-300 leading-relaxed">
                {alert.activitySummary || 'Behavioral anomaly detected exceeding enterprise statistical baselines.'}
              </div>
            </div>

            {/* Contributing Behavioral Dimensions */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Contributing Dimensions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {dimensions.map((dim) => (
                  <div
                    key={dim.label}
                    className={`flex items-center justify-between px-3 py-2 rounded border ${
                      dim.count > 0
                        ? 'border-cyan-500/20 bg-cyan-500/5 text-slate-200'
                        : 'border-slate-800/60 bg-slate-950/20 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <dim.icon className={`h-3.5 w-3.5 ${dim.count > 0 ? 'text-cyan-400' : 'text-slate-600'}`} />
                      <span>{dim.label}</span>
                    </div>
                    <span className={`font-mono font-semibold ${dim.count > 0 ? 'text-cyan-300' : 'text-slate-600'}`}>
                      {dim.count} day(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer / Actions */}
          <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {alert.status === ALERT_STATUS.OPEN && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onStatusChange(alert.alertId, ALERT_STATUS.ACKNOWLEDGED)}
                      disabled={statusLoading}
                      className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10 text-xs"
                    >
                      Acknowledge
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onStatusChange(alert.alertId, ALERT_STATUS.INVESTIGATING)}
                      disabled={statusLoading}
                      className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 text-xs"
                    >
                      Investigate
                    </Button>
                  </>
                )}
                {alert.status === ALERT_STATUS.ACKNOWLEDGED && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onStatusChange(alert.alertId, ALERT_STATUS.INVESTIGATING)}
                    disabled={statusLoading}
                    className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 text-xs"
                  >
                    Start Investigation
                  </Button>
                )}
                {alert.status === ALERT_STATUS.INVESTIGATING && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onStatusChange(alert.alertId, ALERT_STATUS.RESOLVED)}
                      disabled={statusLoading}
                      className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 text-xs"
                    >
                      Resolve Incident
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStatusChange(alert.alertId, ALERT_STATUS.FALSE_POSITIVE)}
                      disabled={statusLoading}
                      className="text-slate-400 hover:text-slate-200 text-xs"
                    >
                      False Positive
                    </Button>
                  </>
                )}
                {(alert.status === ALERT_STATUS.RESOLVED || alert.status === ALERT_STATUS.FALSE_POSITIVE) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onStatusChange(alert.alertId, ALERT_STATUS.INVESTIGATING)}
                    disabled={statusLoading}
                    className="border-slate-700 text-slate-300 text-xs"
                  >
                    Reopen Investigation
                  </Button>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleNavigateInvestigation}
                className="gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white ml-auto"
              >
                <span>View Investigation</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
