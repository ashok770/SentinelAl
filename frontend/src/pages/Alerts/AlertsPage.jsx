import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  X,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  SlidersHorizontal,
} from 'lucide-react';

import { PageHeader } from '../../components/ui/Headers.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table.jsx';
import { SeverityBadge, StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ErrorState, EmptyState } from '../../components/ui/States.jsx';
import { getAlerts, updateAlertStatus, getDashboardSummary } from '../../services/api.js';
import { AlertStatusMenu } from './components/AlertStatusMenu.jsx';
import { AlertDetailDrawer } from './components/AlertDetailDrawer.jsx';
import {
  ALERT_SEVERITY,
  ALERT_STATUS,
  STATUS_LABELS,
  SORT_OPTIONS,
  DEPARTMENTS,
} from '../../constants/alert.constants.js';

export default function AlertsPage() {
  const navigate = useNavigate();

  // Primary Data State
  const [alerts, setAlerts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });
  const [severitySummary, setSeveritySummary] = useState([]);
  const [totalOperationalAlerts, setTotalOperationalAlerts] = useState(0);

  // UI / Async State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Selected Alert for Slide-out Drawer
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sorting Controls
  const [sortBy, setSortBy] = useState('peakScore');
  const [sortOrder, setSortOrder] = useState('desc');

  // Request race-condition protection ref
  const activeRequestRef = useRef(0);

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch global summary metrics on mount
  useEffect(() => {
    async function loadSummary() {
      try {
        const summary = await getDashboardSummary();
        if (summary?.severityDistribution) {
          setSeveritySummary(summary.severityDistribution);
        }
        if (summary?.totals?.alerts) {
          setTotalOperationalAlerts(summary.totals.alerts);
        }
      } catch (err) {
        console.warn('Failed to load global severity summary:', err);
      }
    }
    loadSummary();
  }, []);

  // Fetch paginated alerts from backend
  const fetchAlertsData = useCallback(async (isManualRefresh = false) => {
    const requestId = ++activeRequestRef.current;

    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Build query params strictly adhering to backend contract
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (departmentFilter !== 'ALL') params.department = departmentFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const data = await getAlerts(params);

      // Protect against out-of-order async responses
      if (requestId === activeRequestRef.current) {
        setAlerts(data.alerts || []);
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            page: data.pagination.page,
            limit: data.pagination.limit,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      if (requestId === activeRequestRef.current) {
        console.error('Alert Center error:', err);
        setError(err?.message || 'Failed to retrieve operational alerts from database.');
      }
    } finally {
      if (requestId === activeRequestRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [
    pagination.page,
    pagination.limit,
    sortBy,
    sortOrder,
    debouncedSearch,
    severityFilter,
    statusFilter,
    departmentFilter,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    fetchAlertsData();
  }, [fetchAlertsData]);

  // Reset to page 1 whenever filters or search change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSeverityFilter('ALL');
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setFromDate('');
    setToDate('');
    setSortBy('peakScore');
    setSortOrder('desc');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters =
    debouncedSearch !== '' ||
    severityFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    departmentFilter !== 'ALL' ||
    fromDate !== '' ||
    toDate !== '';

  const activeFilterCount = [
    debouncedSearch !== '',
    severityFilter !== 'ALL',
    statusFilter !== 'ALL',
    departmentFilter !== 'ALL',
    fromDate !== '',
    toDate !== '',
  ].filter(Boolean).length;

  // Handle status transition mutation
  const handleStatusChange = async (alertId, newStatus) => {
    try {
      setActionLoadingId(alertId);

      const updatedAlert = await updateAlertStatus(alertId, newStatus);

      // Update table state locally without full page reload
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === alertId ? { ...a, ...updatedAlert } : a))
      );

      // If drawer is open on this alert, update selectedAlert
      if (selectedAlert && selectedAlert.alertId === alertId) {
        setSelectedAlert((prev) => ({ ...prev, ...updatedAlert }));
      }

      setToastType('success');
      setToastMessage(`Alert ${alertId} updated to ${STATUS_LABELS[newStatus] || newStatus}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update alert status:', err);
      setToastType('error');
      setToastMessage(err?.body?.message || err?.message || `Failed to transition status for ${alertId}`);
      setTimeout(() => setToastMessage(null), 6000);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Pagination calculation
  const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md transition-all ${
            toastType === 'success'
              ? 'bg-slate-900/95 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-900/95 border-red-500/30 text-red-300'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-200 ml-2"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Alert Center"
        description="Review and triage behavioral anomalies detected across monitored identities."
        actions={
          <div className="flex items-center gap-3">
            {totalOperationalAlerts > 0 && (
              <div className="text-right hidden sm:block">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Total Alerts</span>
                <span className="text-xs font-mono font-medium text-slate-300">
                  {totalOperationalAlerts.toLocaleString()} operational records
                </span>
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchAlertsData(true)}
              disabled={refreshing || loading}
              className="gap-2 border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        }
      />

      {/* 2. COMPACT SEVERITY SUMMARY STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {severitySummary.map((item) => {
          const isSelected = severityFilter === item.severity;
          const isCritical = item.severity === ALERT_SEVERITY.CRITICAL;
          const isHigh = item.severity === ALERT_SEVERITY.HIGH;

          return (
            <button
              key={item.severity}
              onClick={() => handleFilterChange(setSeverityFilter, isSelected ? 'ALL' : item.severity)}
              className={`flex items-center justify-between p-3.5 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    isCritical ? 'bg-red-500' : isHigh ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}
                />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {item.severity}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isCritical ? 'Score ≥ 95' : isHigh ? 'Score 90–94' : 'Score 80–89'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-slate-100 block leading-tight">
                  {item.count?.toLocaleString()}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {item.percentage}% of queue
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <Card className="p-4 space-y-3 bg-slate-900/60 border-slate-800/80">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Alert ID, Employee, User ID, Role, Department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-md pl-9 pr-8 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Core Select Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => handleFilterChange(setSeverityFilter, e.target.value)}
              className="bg-slate-950/80 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 min-w-[130px]"
            >
              <option value="ALL">All Severities</option>
              <option value={ALERT_SEVERITY.CRITICAL}>Critical (≥95)</option>
              <option value={ALERT_SEVERITY.HIGH}>High (90–94)</option>
              <option value={ALERT_SEVERITY.ELEVATED}>Elevated (80–89)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="bg-slate-950/80 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 min-w-[135px]"
            >
              <option value="ALL">All Statuses</option>
              <option value={ALERT_STATUS.OPEN}>Open</option>
              <option value={ALERT_STATUS.ACKNOWLEDGED}>Acknowledged</option>
              <option value={ALERT_STATUS.INVESTIGATING}>Investigating</option>
              <option value={ALERT_STATUS.RESOLVED}>Resolved</option>
              <option value={ALERT_STATUS.FALSE_POSITIVE}>False Positive</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => handleFilterChange(setDepartmentFilter, e.target.value)}
              className="bg-slate-950/80 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 max-w-[160px] truncate"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Sort Field Selector */}
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-700/80 rounded-md p-0.5">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-transparent text-xs text-slate-200 px-2 py-1.5 focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                title={`Sorted ${sortOrder === 'desc' ? 'Descending' : 'Ascending'}`}
                className="p-1.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800 transition-colors"
              >
                {sortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Toggle Advanced Filters (Date Range) */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`h-8 text-xs border-slate-700/80 ${
                showAdvancedFilters || fromDate || toDate ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : ''
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
              <span>Dates</span>
            </Button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs text-slate-400 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                <span>Clear ({activeFilterCount})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Expandable Date Range Strip */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              Date Filter (First Seen):
            </span>
            <div className="flex items-center gap-2">
              <label className="text-slate-500">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => handleFilterChange(setFromDate, e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-500">To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => handleFilterChange(setToDate, e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="text-slate-400 hover:text-slate-200 underline text-[11px]"
              >
                Reset Dates
              </button>
            )}
          </div>
        )}
      </Card>

      {/* 4. MAIN ALERT TABLE */}
      <Card className="overflow-hidden border-slate-800/80">
        {/* Table Sub-header with Active Match Count */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>
              Showing <strong className="text-slate-200">{startRecord.toLocaleString()}</strong>–
              <strong className="text-slate-200">{endRecord.toLocaleString()}</strong> of{' '}
              <strong className="text-slate-100">{pagination.total.toLocaleString()}</strong> operational alerts
            </span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-medium">
                Filtered
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Rows per page:</span>
            <select
              value={pagination.limit}
              onChange={(e) => {
                const newLimit = parseInt(e.target.value, 10);
                setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
              }}
              className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-0 overflow-x-auto min-h-[420px]">
          {loading && alerts.length === 0 ? (
            <div className="p-12 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 w-full bg-slate-800/40 rounded animate-pulse" />
              ))}
            </div>
          ) : error && alerts.length === 0 ? (
            <ErrorState
              message={error}
              onRetry={() => fetchAlertsData(false)}
              className="border-0 py-16"
            />
          ) : alerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-800 text-slate-400 text-xs hover:bg-transparent">
                  <TableHead className="w-[180px]">Alert ID</TableHead>
                  <TableHead>Monitored Identity</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Peak Score</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow
                    key={alert.alertId}
                    className={`cursor-pointer hover:bg-slate-800/60 transition-colors border-b border-slate-800/50 group ${
                      selectedAlert?.alertId === alert.alertId ? 'bg-cyan-500/5 border-cyan-500/30' : ''
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    {/* Alert ID */}
                    <TableCell className="font-mono text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                      {alert.alertId}
                    </TableCell>

                    {/* Monitored Identity */}
                    <TableCell>
                      <div className="leading-tight">
                        <p className="font-medium text-sm text-slate-200 group-hover:text-white transition-colors">
                          {alert.employeeName || alert.userId}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">{alert.userId}</p>
                      </div>
                    </TableCell>

                    {/* Department */}
                    <TableCell className="text-xs text-slate-300">
                      {alert.department || '—'}
                    </TableCell>

                    {/* Role */}
                    <TableCell className="text-xs text-slate-400 max-w-[140px] truncate" title={alert.role}>
                      {alert.role || '—'}
                    </TableCell>

                    {/* Severity */}
                    <TableCell>
                      <SeverityBadge severity={alert.severity} />
                    </TableCell>

                    {/* Peak Score */}
                    <TableCell>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono font-bold text-xs text-red-400">
                          {typeof alert.peakScore === 'number' ? alert.peakScore.toFixed(1) : alert.peakScore}
                        </span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </div>
                    </TableCell>

                    {/* Duration */}
                    <TableCell className="text-xs text-slate-300 whitespace-nowrap">
                      <span>{alert.durationDays}d</span>
                      {alert.anomalousDays && alert.anomalousDays !== alert.durationDays && (
                        <span className="text-slate-500 text-[10px] ml-1">({alert.anomalousDays}a)</span>
                      )}
                    </TableCell>

                    {/* Last Seen */}
                    <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                      {alert.lastSeen
                        ? new Date(alert.lastSeen).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={alert.status} />
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <AlertStatusMenu
                        alert={alert}
                        onStatusChange={handleStatusChange}
                        loading={actionLoadingId === alert.alertId}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title={hasActiveFilters ? 'No alerts match the active filters' : 'No operational alerts available'}
              description={
                hasActiveFilters
                  ? 'Try broadening your search query or adjusting your severity and status filters.'
                  : 'Your environment is currently clear of anomalous activity.'
              }
              action={
                hasActiveFilters ? (
                  <Button variant="secondary" size="sm" onClick={clearFilters} className="text-xs">
                    Clear Filters
                  </Button>
                ) : null
              }
              className="border-0 py-16"
            />
          )}
        </div>

        {/* 5. SERVER-SIDE PAGINATION BAR */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Page <strong className="text-slate-200">{pagination.page}</strong> of{' '}
              <strong className="text-slate-200">{pagination.totalPages.toLocaleString()}</strong>
            </span>

            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
                disabled={pagination.page <= 1 || loading}
                className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page <= 1 || loading}
                className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Dynamic Page Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  const isActive = pageNum === pagination.page;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                      disabled={loading}
                      className={`h-7 min-w-[28px] px-1.5 rounded text-xs font-mono font-medium transition-colors ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))
                }
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.totalPages }))}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* 6. SLIDE-OUT DETAIL PREVIEW DRAWER */}
      {selectedAlert && (
        <AlertDetailDrawer
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onStatusChange={handleStatusChange}
          statusLoading={actionLoadingId === selectedAlert.alertId}
        />
      )}
    </div>
  );
}
