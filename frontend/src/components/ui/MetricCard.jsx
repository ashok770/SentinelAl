import React from 'react';
import { Card, CardContent } from './Card.jsx';

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-slate-400',
  accentColor,
  trend,
  trendValue,
  className = '',
}) {
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {accentColor && (
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] ${accentColor}`}
        />
      )}
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/80 border border-slate-700/50">
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className="text-3xl font-bold tracking-tight text-slate-100">
            {typeof value === 'number' ? value.toLocaleString() : value ?? '—'}
          </p>
          {trend && (
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-400">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
