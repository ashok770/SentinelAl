import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button.jsx';

export function LoadingState({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-slate-500 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-cyan-500" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center border border-red-500/20 bg-red-500/5 rounded-lg ${className}`}>
      <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
      <p className="text-slate-300 text-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-lg ${className}`}>
      {Icon && <Icon className="h-10 w-10 text-slate-600 mb-4" />}
      <h3 className="text-slate-200 font-medium mb-1">{title}</h3>
      {description && <p className="text-slate-500 text-sm mb-4 max-w-sm">{description}</p>}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
