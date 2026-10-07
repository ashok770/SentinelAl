import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle, 
  Eye, 
  Search, 
  XCircle, 
  RotateCcw, 
  MoreHorizontal,
  Loader2 
} from 'lucide-react';
import { ALERT_STATUS } from '../../../constants/alert.constants.js';

export function AlertStatusMenu({ 
  alert, 
  onStatusChange, 
  loading = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (e, newStatus) => {
    e.stopPropagation();
    setIsOpen(false);
    onStatusChange(alert.alertId, newStatus);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-end px-2">
        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
      </div>
    );
  }

  // Define valid next states based on backend state machine
  const getActions = () => {
    switch (alert.status) {
      case ALERT_STATUS.OPEN:
        return [
          {
            status: ALERT_STATUS.ACKNOWLEDGED,
            label: 'Acknowledge',
            icon: Eye,
            className: 'text-amber-400 hover:bg-amber-500/10',
          },
          {
            status: ALERT_STATUS.INVESTIGATING,
            label: 'Investigate',
            icon: Search,
            className: 'text-cyan-400 hover:bg-cyan-500/10',
          },
          {
            status: ALERT_STATUS.RESOLVED,
            label: 'Quick Resolve',
            icon: CheckCircle,
            className: 'text-emerald-400 hover:bg-emerald-500/10',
          },
          {
            status: ALERT_STATUS.FALSE_POSITIVE,
            label: 'False Positive',
            icon: XCircle,
            className: 'text-slate-400 hover:bg-slate-700/50',
          },
        ];

      case ALERT_STATUS.ACKNOWLEDGED:
        return [
          {
            status: ALERT_STATUS.INVESTIGATING,
            label: 'Start Investigation',
            icon: Search,
            className: 'text-cyan-400 hover:bg-cyan-500/10',
          },
          {
            status: ALERT_STATUS.RESOLVED,
            label: 'Resolve',
            icon: CheckCircle,
            className: 'text-emerald-400 hover:bg-emerald-500/10',
          },
          {
            status: ALERT_STATUS.FALSE_POSITIVE,
            label: 'False Positive',
            icon: XCircle,
            className: 'text-slate-400 hover:bg-slate-700/50',
          },
        ];

      case ALERT_STATUS.INVESTIGATING:
        return [
          {
            status: ALERT_STATUS.RESOLVED,
            label: 'Resolve Incident',
            icon: CheckCircle,
            className: 'text-emerald-400 hover:bg-emerald-500/10',
          },
          {
            status: ALERT_STATUS.FALSE_POSITIVE,
            label: 'Mark False Positive',
            icon: XCircle,
            className: 'text-slate-400 hover:bg-slate-700/50',
          },
          {
            status: ALERT_STATUS.ACKNOWLEDGED,
            label: 'Return to Triage',
            icon: Eye,
            className: 'text-amber-400 hover:bg-amber-500/10',
          },
        ];

      case ALERT_STATUS.RESOLVED:
      case ALERT_STATUS.FALSE_POSITIVE:
        return [
          {
            status: ALERT_STATUS.INVESTIGATING,
            label: 'Reopen Investigation',
            icon: RotateCcw,
            className: 'text-cyan-400 hover:bg-cyan-500/10',
          },
        ];

      default:
        return [];
    }
  };

  const actions = getActions();

  // If status is OPEN, show inline quick buttons + dropdown
  if (alert.status === ALERT_STATUS.OPEN) {
    return (
      <div className="flex items-center justify-end gap-1.5" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => handleAction(e, ALERT_STATUS.ACKNOWLEDGED)}
          title="Acknowledge Alert"
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
        >
          <Eye className="h-3 w-3" />
          <span>Ack</span>
        </button>
        <button
          type="button"
          onClick={(e) => handleAction(e, ALERT_STATUS.INVESTIGATING)}
          title="Start Investigation"
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-colors"
        >
          <Search className="h-3 w-3" />
          <span>Investigate</span>
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="More Actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {isOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-slate-800 bg-slate-900 shadow-xl z-30 py-1 text-xs">
              {actions.map((act) => (
                <button
                  key={act.status}
                  type="button"
                  onClick={(e) => handleAction(e, act.status)}
                  className={`w-full text-left px-3 py-1.5 flex items-center gap-2 font-medium transition-colors ${act.className}`}
                >
                  <act.icon className="h-3.5 w-3.5" />
                  <span>{act.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // For other statuses, show dedicated action buttons
  return (
    <div className="flex items-center justify-end gap-1.5 relative" ref={menuRef}>
      {alert.status === ALERT_STATUS.ACKNOWLEDGED && (
        <button
          type="button"
          onClick={(e) => handleAction(e, ALERT_STATUS.INVESTIGATING)}
          title="Start Investigation"
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-colors"
        >
          <Search className="h-3 w-3" />
          <span>Investigate</span>
        </button>
      )}

      {alert.status === ALERT_STATUS.INVESTIGATING && (
        <button
          type="button"
          onClick={(e) => handleAction(e, ALERT_STATUS.RESOLVED)}
          title="Resolve Incident"
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
        >
          <CheckCircle className="h-3 w-3" />
          <span>Resolve</span>
        </button>
      )}

      {(alert.status === ALERT_STATUS.RESOLVED || alert.status === ALERT_STATUS.FALSE_POSITIVE) && (
        <button
          type="button"
          onClick={(e) => handleAction(e, ALERT_STATUS.INVESTIGATING)}
          title="Reopen Investigation"
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reopen</span>
        </button>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Change Status"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-slate-800 bg-slate-900 shadow-xl z-30 py-1 text-xs">
            {actions.map((act) => (
              <button
                key={act.status}
                type="button"
                onClick={(e) => handleAction(e, act.status)}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 font-medium transition-colors ${act.className}`}
              >
                <act.icon className="h-3.5 w-3.5" />
                <span>{act.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
