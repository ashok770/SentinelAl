import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Users,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  PieChart as PieIcon,
  Building2,
  CheckCircle2,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { PageHeader } from '../../components/ui/Headers.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.jsx';
import { MetricCard } from '../../components/ui/MetricCard.jsx';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table.jsx';
import { SeverityBadge, StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States.jsx';
import { getDashboardSummary } from '../../services/api.js';
import { ROUTES } from '../../constants/routes.js';

// Calibrated enterprise severity color palette
const SEVERITY_PALETTE = {
  CRITICAL: {
    color: '#ef4444', // Red-500
    fill: 'rgba(239, 68, 68, 0.2)',
    badgeBg: 'bg-red-500/10',
    badgeText: 'text-red-400',
    border: 'border-red-500/20',
  },
  HIGH: {
    color: '#f97316', // Orange-500
    fill: 'rgba(249, 115, 22, 0.2)',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-400',
    border: 'border-orange-500/20',
  },
  ELEVATED: {
    color: '#eab308', // Yellow-500
    fill: 'rgba(234, 179, 8, 0.2)',
    badgeBg: 'bg-yellow-500/10',
    badgeText: 'text-yellow-400',
    border: 'border-yellow-500/20',
  },
};

const STATUS_LABELS = {
  OPEN: 'Open',
  ACKNOWLEDGED: 'Acknowledged',
  INVESTIGATING: 'Investigating',
  RESOLVED: 'Resolved',
  FALSE_POSITIVE: 'False Positive',
};

// Custom Tooltip for Trend Chart
function CustomTrendTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs">
        <p className="font-semibold text-slate-200 mb-2">{label}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span className="font-medium">Total Alerts:</span>
            <span className="font-bold text-slate-100">{data.count?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-red-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Critical (≥95):
            </span>
            <span className="font-semibold">{data.critical?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-orange-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              High (90–94):
            </span>
            <span className="font-semibold">{data.high?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-yellow-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Elevated (80–89):
            </span>
            <span className="font-semibold">{data.elevated?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// Custom Tooltip for Top Departments Bar Chart
function CustomDeptTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-700/80 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs">
        <p className="font-semibold text-slate-200 mb-1">{data.department}</p>
        <div className="flex items-center justify-between gap-4 text-cyan-400">
          <span>Operational Alerts:</span>
          <span className="font-bold">{data.count?.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async (isManual = false) => {
    try {
      if (isManual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await getDashboardSummary();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.message || 'Failed to aggregate security intelligence. Please check backend connectivity.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !dashboardData) {
    return <LoadingState message="Aggregating operational security intelligence from MongoDB..." className="min-h-[70vh]" />;
  }

  if (error && !dashboardData) {
    return <ErrorState message={error} onRetry={() => fetchDashboard(false)} className="min-h-[70vh]" />;
  }

  const {
    totals = {},
    severityDistribution = [],
    statusDistribution = [],
    alertTrend = [],
    topDepartments = [],
    priorityQueue = [],
  } = dashboardData || {};

  // Formatted date string for Page Header
  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

  // Format Trend for X-Axis Labels (e.g. "2010-01" -> "Jan '10")
  const formattedTrendData = alertTrend.map((item) => {
    const [year, month] = item.date.split('-');
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    return {
      ...item,
      displayDate: label,
    };
  });

  // Calculate total status count for percentage calculation
  const totalStatusCount = statusDistribution.reduce((sum, item) => sum + (item.count || 0), 0) || totals.alerts || 1;

  // Max department count for percentage calculation in bar chart
  const maxDeptCount = topDepartments.length > 0 ? Math.max(...topDepartments.map((d) => d.count)) : 1;

  return (
    <div className="space-y-6">
      {/* A. PAGE HEADER */}
      <PageHeader
        title="Security Overview"
        description="Real-time overview of identity-based behavioral anomalies and investigation workload."
        actions={
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Last Synced</span>
              <span className="text-xs font-mono font-medium text-slate-300">{formattedLastUpdated}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing || loading}
              className="gap-2 border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        }
      />

      {/* B. KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Operational Alerts"
          value={totals.alerts ?? 0}
          subtitle="Calibrated anomaly episodes"
          icon={ShieldAlert}
          iconColor="text-cyan-400"
          accentColor="bg-cyan-500"
        />
        <MetricCard
          title="Critical Alerts"
          value={totals.critical ?? 0}
          subtitle="Calibrated peak score ≥ 95"
          icon={AlertTriangle}
          iconColor="text-red-400"
          accentColor="bg-red-500"
        />
        <MetricCard
          title="Open Investigations"
          value={totals.openInvestigations ?? 0}
          subtitle="Active SOC triage workload"
          icon={Clock}
          iconColor="text-amber-400"
          accentColor="bg-amber-500"
        />
        <MetricCard
          title="High-Risk Identities"
          value={totals.highRiskIdentities ?? 0}
          subtitle="Users with Critical/High episodes"
          icon={Users}
          iconColor="text-purple-400"
          accentColor="bg-purple-500"
        />
      </div>

      {/* C & D. CHARTS ROW: Trend Line + Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* D. ALERT ACTIVITY TREND */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Alert Activity Trend
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly aggregated behavioral anomaly volume across 16.5 months of telemetry
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Total
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Critical
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[320px] pt-4">
            {formattedTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={formattedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGradientTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="trendGradientCritical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Total Alerts"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#trendGradientTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="critical"
                    name="Critical Alerts"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#trendGradientCritical)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No trend data available"
                description="Aggregated alert telemetry will be graphed here."
              />
            )}
          </CardContent>
        </Card>

        {/* C. ALERT SEVERITY DISTRIBUTION */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-amber-400" />
              Severity Distribution
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Current breakdown of operational alert queue by calibrated risk tier
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-2 min-h-[320px]">
            <div className="h-[180px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                    stroke="#0f172a"
                    strokeWidth={2}
                  >
                    {severityDistribution.map((entry) => (
                      <Cell
                        key={`cell-${entry.severity}`}
                        fill={SEVERITY_PALETTE[entry.severity]?.color || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs uppercase font-medium text-slate-500">Total</span>
                <span className="text-base font-bold text-slate-100">
                  {totals.alerts ? totals.alerts.toLocaleString() : '0'}
                </span>
              </div>
            </div>

            {/* Structured Severity Legend */}
            <div className="space-y-2 mt-3 pt-3 border-t border-slate-800/80">
              {severityDistribution.map((item) => {
                const palette = SEVERITY_PALETTE[item.severity] || {};
                return (
                  <div
                    key={item.severity}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900/60 border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: palette.color || '#94a3b8' }}
                      />
                      <span className="text-xs font-medium text-slate-300">{item.severity}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-slate-100">
                        {item.count.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 w-12 text-right">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* E & F. ROW: Top Departments & Investigation Lifecycle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* F. TOP DEPARTMENTS */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-400" />
              Top Departments by Alert Volume
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Organizational units with the highest concentration of operational anomaly episodes
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {topDepartments.length > 0 ? (
              <div className="space-y-3.5">
                {topDepartments.map((dept, index) => {
                  const percentage = ((dept.count / (totals.alerts || 1)) * 100).toFixed(1);
                  const barWidth = Math.round((dept.count / maxDeptCount) * 100);

                  return (
                    <div key={dept.department} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-medium text-slate-200">
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-400">
                            {index + 1}
                          </span>
                          <span>{dept.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">{dept.count.toLocaleString()} alerts</span>
                          <span className="text-slate-500 font-mono">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title="No department data"
                description="Department metrics will display once alerts are ingested."
              />
            )}
          </CardContent>
        </Card>

        {/* E. INVESTIGATION STATUS */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Investigation Queue Status
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Lifecycle triage progress across all operational alerts
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-2">
            <div className="space-y-3">
              {statusDistribution.map((item) => {
                const count = item.count || 0;
                const percentage = ((count / totalStatusCount) * 100).toFixed(1);

                return (
                  <div
                    key={item.status}
                    className="flex items-center justify-between p-2.5 rounded-md bg-slate-900/60 border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-200">
                        {count.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 w-10 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Triage Completion Rate</span>
                <span className="font-semibold text-slate-200">
                  {totalStatusCount > 0
                    ? `${(
                        (((statusDistribution.find((s) => s.status === 'RESOLVED')?.count || 0) +
                          (statusDistribution.find((s) => s.status === 'FALSE_POSITIVE')?.count || 0)) /
                          totalStatusCount) *
                        100
                      ).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* G. PRIORITY INVESTIGATION QUEUE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              Priority Investigation Queue
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Highest-risk operational alerts sorted by calibrated peak score and incident severity
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.alerts)}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-xs"
          >
            <span>View All Alerts</span>
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardHeader>
        <div className="p-0 overflow-x-auto">
          {priorityQueue.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-800 text-slate-400 text-xs hover:bg-transparent">
                  <TableHead className="w-[180px]">Alert ID</TableHead>
                  <TableHead>Monitored Identity</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Peak Score</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priorityQueue.map((alert) => (
                  <TableRow
                    key={alert.alertId}
                    className="cursor-pointer hover:bg-slate-800/60 transition-colors border-b border-slate-800/50 group"
                    onClick={() => navigate(ROUTES.alerts)}
                  >
                    <TableCell className="font-mono text-xs font-medium text-cyan-400">
                      {alert.alertId}
                    </TableCell>
                    <TableCell>
                      <div className="leading-tight">
                        <p className="font-medium text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {alert.employeeName || alert.userId}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {alert.userId} · {alert.role || 'Employee'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {alert.department || '—'}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={alert.severity} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-red-400">
                          {typeof alert.peakScore === 'number' ? alert.peakScore.toFixed(1) : alert.peakScore}
                        </span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                      {alert.firstSeen
                        ? new Date(alert.firstSeen).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={alert.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors inline" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="No priority alerts in queue"
              description="When critical behavioral deviations are detected, they will be prioritized here."
              className="border-0 py-8"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
