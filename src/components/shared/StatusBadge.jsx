import React from 'react';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS = {
  // Lead statuses
  'hot': { bg: 'bg-orange-500/10', text: 'text-orange-700', border: 'border-orange-500/30' },
  'new': { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500/30' },
  'cold': { bg: 'bg-slate-500/10', text: 'text-slate-700', border: 'border-slate-500/30' },
  'won': { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/30' },
  'lost': { bg: 'bg-red-500/10', text: 'text-red-700', border: 'border-red-500/30' },
  
  // Urgency
  'urgent': { bg: 'bg-red-500/10', text: 'text-red-700', border: 'border-red-500/30' },
  'high': { bg: 'bg-orange-500/10', text: 'text-orange-700', border: 'border-orange-500/30' },
  'medium': { bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500/30' },
  'low': { bg: 'bg-slate-500/10', text: 'text-slate-700', border: 'border-slate-500/30' },
  
  // Severity
  'critical': { bg: 'bg-red-500/10', text: 'text-red-700', border: 'border-red-500/30' },
  'warning': { bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500/30' },
  'info': { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500/30' },
  
  // Status
  'pending': { bg: 'bg-slate-500/10', text: 'text-slate-700', border: 'border-slate-500/30' },
  'completed': { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/30' },
  'failed': { bg: 'bg-red-500/10', text: 'text-red-700', border: 'border-red-500/30' },
  'active': { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/30' },
  
  // Default
  'default': { bg: 'bg-slate-500/10', text: 'text-slate-700', border: 'border-slate-500/30' },
};

export default function StatusBadge({ status, className = '' }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS['default'];
  return (
    <Badge className={`${colors.bg} ${colors.text} border ${colors.border} capitalize text-[10px] h-5 px-1.5 ${className}`}>
      {status?.replace(/_/g, ' ')}
    </Badge>
  );
}
