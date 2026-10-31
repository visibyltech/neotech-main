export function formatNaira(amount: number): string {
  if (isNaN(amount)) return '₦0';
  return '₦' + new Intl.NumberFormat('en-NG').format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Delivered':
    case 'paid':
    case 'approved':
    case 'completed':
    case 'verified':
      return { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-700/60' };

    case 'In Transit':
    case 'Dispatched':
      return { bg: 'bg-cyan-950/60', text: 'text-cyan-400', border: 'border-cyan-700/60' };

    case 'Processing':
    case 'Ready for Pickup':
    case 'Confirmed':
      return { bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-700/60' };

    case 'Payment Verification':
    case 'verifying':
    case 'pending':
    case 'active':
      return { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-700/60' };

    case 'Cancelled':
    case 'rejected':
    case 'failed':
      return { bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-700/60' };

    default:
      return { bg: 'bg-slate-900', text: 'text-slate-300', border: 'border-slate-800' };
  }
}
