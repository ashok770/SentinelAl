import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  RefreshCw, 
  Search, 
  Filter, 
  CheckCircle,
  Eye,
  AlertTriangle,
  XCircle,
  Activity
} from 'lucide-react';

import { PageHeader } from '../../components/ui/Headers.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { MetricCard } from '../../components/ui/MetricCard.jsx';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table.jsx';
import { SeverityBadge, StatusBadge } from '../../components/ui/Badge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { getAlerts, acknowledgeAlert, resolveAlert } from '../../services/api.js';
import { ROUTES } from '../../constants/routes.js';

export default function AlertsPage() {
  const navigate = useNavigate();
  
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null); // stores alertId currently being acted upon
  const [actionError, setActionError] = useState(null);

  const fetchAlertsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Alerts error:", err);
      setError("Failed to load alerts. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const handleAcknowledge = async (e, alertId) => {
    e.stopPropagation();
    try {
      setActionLoading(alertId);
      setActionError(null);
      const updatedAlert = await acknowledgeAlert(alertId);
      
      setAlerts(prev => prev.map(a => a.alertId === alertId ? updatedAlert : a));
    } catch (err) {
      console.error("Failed to acknowledge:", err);
      setActionError(`Failed to acknowledge alert ${alertId}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (e, alertId) => {
    e.stopPropagation();
    try {
      setActionLoading(alertId);
      setActionError(null);
      const updatedAlert = await resolveAlert(alertId);
      
      setAlerts(prev => prev.map(a => a.alertId === alertId ? updatedAlert : a));
    } catch (err) {
      console.error("Failed to resolve:", err);
      setActionError(`Failed to resolve alert ${alertId}`);
    } finally {
      setActionLoading(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSeverityFilter('ALL');
    setStatusFilter('ALL');
  };

  // Derived State (Summary Metrics calculated against all alerts)
  const totalAlerts = alerts.length;
  const openAlerts = alerts.filter(a => a.status === 'OPEN').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
  const highAlerts = alerts.filter(a => a.severity === 'HIGH').length;

  // Derived State (Filtered Alerts)
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Status Match
      if (statusFilter !== 'ALL' && alert.status !== statusFilter) return false;
      
      // Severity Match
      if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false;
      
      // Search Match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = alert.title?.toLowerCase().includes(query);
        const matchesId = alert.alertId?.toLowerCase().includes(query);
        const matchesUser = alert.userId?.toLowerCase().includes(query);
        const matchesSummary = alert.summary?.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesId && !matchesUser && !matchesSummary) {
          return false;
        }
      }
      
      return true;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  const hasActiveFilters = searchQuery !== '' || severityFilter !== 'ALL' || statusFilter !== 'ALL';

  if (loading && alerts.length === 0) {
    return <LoadingState message="Loading alert data..." className="min-h-[60vh]" />;
  }

  if (error && alerts.length === 0) {
    return <ErrorState message={error} onRetry={fetchAlertsData} className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Alerts" 
        description="Review and triage identity-risk alerts" 
        actions={
          <Button variant="secondary" size="sm" onClick={fetchAlertsData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Global Action Error Toast */}
      {actionError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-center justify-between text-sm text-red-400">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-slate-400 hover:text-white">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Alerts" value={totalAlerts} icon={Activity} />
        <MetricCard title="Open Alerts" value={openAlerts} icon={ShieldAlert} />
        <MetricCard title="Critical Alerts" value={criticalAlerts} icon={AlertTriangle} />
        <MetricCard title="High Alerts" value={highAlerts} icon={AlertTriangle} />
      </div>

      <Card>
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/30 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by ID, User, or Title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500 hidden sm:block" />
              <select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none min-w-[120px]"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none min-w-[140px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400 hover:text-slate-200">
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Alert Table */}
        <div className="p-0 overflow-x-auto">
          {filteredAlerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Alert</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map(alert => (
                  <TableRow 
                    key={alert.alertId}
                    className="cursor-pointer group"
                    onClick={() => navigate(`${ROUTES.alerts}/${alert.alertId}`)}
                  >
                    <TableCell><SeverityBadge severity={alert.severity} /></TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-200 max-w-[280px] truncate" title={alert.title}>
                        {alert.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{alert.alertId}</div>
                    </TableCell>
                    <TableCell className="text-slate-300 font-medium">{alert.userId}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${alert.riskScore >= 75 ? 'text-red-400' : 'text-orange-400'}`}>
                        {alert.riskScore} / 100
                      </span>
                    </TableCell>
                    <TableCell><StatusBadge status={alert.status} /></TableCell>
                    <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                      {new Date(alert.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                        {alert.status === 'OPEN' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-0"
                            onClick={(e) => handleAcknowledge(e, alert.alertId)}
                            disabled={actionLoading === alert.alertId}
                          >
                            <Eye className="h-3 w-3 mr-1.5" />
                            Ack
                          </Button>
                        )}
                        {(alert.status === 'OPEN' || alert.status === 'ACKNOWLEDGED') && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-0"
                            onClick={(e) => handleResolve(e, alert.alertId)}
                            disabled={actionLoading === alert.alertId}
                          >
                            <CheckCircle className="h-3 w-3 mr-1.5" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              icon={ShieldAlert}
              title={hasActiveFilters ? "No alerts match filters" : "There are currently no security alerts."}
              description={hasActiveFilters ? "Try adjusting your search query, severity, or status filters." : "Your environment is currently clear."}
              className="border-0"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
