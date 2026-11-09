export function formatCurrency(amount: number, currency: 'NGN' | 'USD' | 'GBP' | 'EUR' = 'NGN'): string {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG')}`;
  }
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US')}`;
  }
  if (currency === 'GBP') {
    return `£${amount.toLocaleString('en-GB')}`;
  }
  return `€${amount.toLocaleString('en-IE')}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffDays = Math.round(diffSec / 86400);

    if (Math.abs(diffDays) < 1) {
      const diffHours = Math.round(diffSec / 3600);
      if (diffHours === 0) {
        const diffMins = Math.round(diffSec / 60);
        if (diffMins === 0) return 'Just now';
        return diffMins > 0 ? `In ${diffMins} min` : `${Math.abs(diffMins)} min ago`;
      }
      return diffHours > 0 ? `In ${diffHours} hr` : `${Math.abs(diffHours)} hr ago`;
    }

    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;

    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function isOverdue(dateString: string | undefined): boolean {
  if (!dateString) return false;
  try {
    const d = new Date(dateString);
    const now = new Date();
    return d.getTime() < now.getTime();
  } catch {
    return false;
  }
}

export function isDueToday(dateString: string | undefined): boolean {
  if (!dateString) return false;
  try {
    const d = new Date(dateString);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  } catch {
    return false;
  }
}

export function getStatusBadgeConfig(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    // Inquiry statuses
    case 'new':
      return { label: 'New Submission', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'unreviewed':
      return { label: 'Unreviewed', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'under_review':
      return { label: 'Under Review', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'contacted':
      return { label: 'Contacted', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 'awaiting_client':
      return { label: 'Awaiting Client', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
    case 'qualified':
      return { label: 'Qualified Lead', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' };
    case 'proposal_requested':
      return { label: 'Proposal Requested', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'converted':
      return { label: 'Converted to Deal', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300' };
    case 'not_qualified':
      return { label: 'Not Qualified', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' };
    case 'closed_lost':
      return { label: 'Closed / Lost', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'archived':
      return { label: 'Archived', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' };

    // Project statuses
    case 'not_started':
      return { label: 'Not Started', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    case 'planning':
      return { label: 'Planning', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'in_progress':
      return { label: 'In Progress', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' };
    case 'completed':
      return { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400' };
    case 'on_hold':
      return { label: 'On Hold', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' };

    // Default
    default:
      return { label: status, bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  }
}

export function getPriorityBadge(priority: 'low' | 'medium' | 'high' | 'urgent'): { label: string; color: string; dotColor: string } {
  switch (priority) {
    case 'urgent':
      return { label: 'Urgent', color: 'text-rose-700 bg-rose-50 border-rose-200', dotColor: 'bg-rose-500' };
    case 'high':
      return { label: 'High', color: 'text-amber-700 bg-amber-50 border-amber-200', dotColor: 'bg-amber-500' };
    case 'medium':
      return { label: 'Medium', color: 'text-blue-700 bg-blue-50 border-blue-200', dotColor: 'bg-blue-500' };
    case 'low':
      return { label: 'Low', color: 'text-slate-600 bg-slate-50 border-slate-200', dotColor: 'bg-slate-400' };
  }
}

export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
