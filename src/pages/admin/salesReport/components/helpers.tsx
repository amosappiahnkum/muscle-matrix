import { format, subDays } from 'date-fns';
import { Transaction } from '@/types';
import { DateRange, ReportSummary } from '@/types';

export const getDateRangeLabel = (
  dateRange: DateRange,
  startDate: string,
  endDate:   string,
): string => {
  switch (dateRange) {
    case 'today':  return `Today — ${format(new Date(), 'MMMM dd, yyyy')}`;
    case 'week':   return `Last 7 Days (${format(subDays(new Date(), 7), 'MMM dd')} – ${format(new Date(), 'MMM dd, yyyy')})`;
    case 'month':  return `Last 30 Days (${format(subDays(new Date(), 30), 'MMM dd')} – ${format(new Date(), 'MMM dd, yyyy')})`;
    case 'all':    return 'All Time Report';
    case 'custom': return `${startDate} to ${endDate}`;
    default:       return '';
  }
};

export const buildSummary = (transactions: Transaction[]): ReportSummary => {
  const ws = transactions.filter((t) => t.type === 'wholesale');
  const rt = transactions.filter((t) => t.type === 'retail');
  const wholesaleTotal = ws.reduce((s, t) => s + t.totalAmount, 0);
  const retailTotal    = rt.reduce((s, t) => s + t.totalAmount, 0);
  return {
    wholesaleTotal,
    retailTotal,
    totalSales:       wholesaleTotal + retailTotal,
    transactionCount: transactions.length,
    wholesaleCount:   ws.length,
    retailCount:      rt.length,
  };
};