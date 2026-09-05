import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertBannerProps {
  type: 'error' | 'success' | 'warning';
  title?: string;
  message: string;
  className?: string;
}

export default function AlertBanner({ type, title, message, className = '' }: AlertBannerProps) {
  let icon;
  let bgClass = '';
  let borderClass = '';
  let textClass = '';

  switch (type) {
    case 'error':
      icon = <AlertCircle className="w-5 h-5 text-[var(--danger)]" />;
      bgClass = 'bg-[var(--danger)]/10';
      borderClass = 'border-[var(--danger)]/20';
      textClass = 'text-[var(--danger)]';
      break;
    case 'success':
      icon = <CheckCircle className="w-5 h-5 text-[var(--success)]" />;
      bgClass = 'bg-[var(--success)]/10';
      borderClass = 'border-[var(--success)]/20';
      textClass = 'text-[var(--success)]';
      break;
    case 'warning':
      icon = <Info className="w-5 h-5 text-[var(--warning)]" />;
      bgClass = 'bg-[var(--warning)]/10';
      borderClass = 'border-[var(--warning)]/20';
      textClass = 'text-[var(--warning)]';
      break;
  }

  return (
    <div className={`p-4 rounded-[var(--radius-md)] border ${bgClass} ${borderClass} flex gap-3 ${className}`}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        {title && <h4 className={`font-bold text-[var(--text-body)] ${textClass} mb-1`}>{title}</h4>}
        <p className={`text-[var(--text-small)] ${textClass}`}>{message}</p>
      </div>
    </div>
  );
}
