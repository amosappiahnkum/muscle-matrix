import type { Dayjs } from 'dayjs';
import { Transaction } from '@/types';
import { ReportSummary } from '@/types';

export const getDateRangeLabel = (dateValue: [Dayjs, Dayjs] | null): string => {
  if (!dateValue) return 'All Time Report';
  const [start, end] = dateValue;
  return `${start.format('MMM DD, YYYY')} – ${end.format('MMM DD, YYYY')}`;
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
