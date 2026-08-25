import React from 'react';
import { getStatusBadgeStyle } from '../../utils/formatters.js';

interface BadgeProps {
  status: string;
  label?: string;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, showDot = true }) => {
  const style = getStatusBadgeStyle(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>}
      {label || status.replace(/_/g, ' ')}
    </span>
  );
};
