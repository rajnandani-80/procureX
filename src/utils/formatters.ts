export const formatCurrency = (amount: number = 0, currency = 'INR (₹)'): string => {
  if (currency.includes('USD') || currency === '$') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const getStatusBadgeStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'HEALTHY':
    case 'ACCEPTED':
    case 'CLOSED':
    case 'RECEIVED':
      return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };

    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'LOW_STOCK':
    case 'DISPATCHED':
      return { bg: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30', dot: 'bg-[#D4AF37]' };

    case 'REJECTED':
    case 'BLOCKED':
    case 'OUT_OF_STOCK':
    case 'INACTIVE':
    case 'EXPIRED':
    case 'SUSPENDED':
      return { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', dot: 'bg-rose-400' };

    case 'CREATED':
    default:
      return { bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', dot: 'bg-cyan-400' };
  }
};
