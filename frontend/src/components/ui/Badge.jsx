import React from 'react';

export function Badge({ children, variant = 'default', className = '', ...props }) {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border';
  
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    elevated: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    blue: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    neutral: 'bg-slate-800 text-slate-400 border-slate-700/60'
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </span>
  );
}

export function SeverityBadge({ severity, className = '' }) {
  const variantMap = {
    LOW: 'low',
    MEDIUM: 'medium',
    ELEVATED: 'elevated',
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  return (
    <Badge variant={variantMap[severity] || 'default'} className={className}>
      {severity}
    </Badge>
  );
}

export function StatusBadge({ status, className = '' }) {
  const variantMap = {
    OPEN: 'critical',
    ACKNOWLEDGED: 'medium',
    INVESTIGATING: 'blue',
    RESOLVED: 'low',
    FALSE_POSITIVE: 'neutral'
  };

  return (
    <Badge variant={variantMap[status] || 'default'} className={className}>
      {status ? status.replace('_', ' ') : 'UNKNOWN'}
    </Badge>
  );
}
