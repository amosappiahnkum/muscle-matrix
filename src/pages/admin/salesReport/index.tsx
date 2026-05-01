import React, { useState, useEffect, useCallback } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { Printer, BarChart2 } from 'lucide-react';
import { Transaction } from '@/types';
import { getTransactions } from '@/api/api.ts';
import Button from '../../../components/common/Button.tsx';
import { ErrorBanner } from '../../../components/common/Banner.tsx';

import { DateRange, SaleType, ReportSummary, emptyReport } from '@/types';
import { getDateRangeLabel, buildSummary }                  from './components/helpers.tsx';
import { buildPrintHTML, triggerPrint }                     from './components/printBuilder.tsx';
import { ReportFilters }                                     from './components/ReportFilters.tsx';
import { SummaryCards }                                      from './components/SummaryCards.tsx';
import { TransactionsTable }                                 from './components/TransactionsTable.tsx';

const SalesReport: React.FC = () => {
  const [dateRange,     setDateRange]     = useState<DateRange>('today');
  const [startDate,     setStartDate]     = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate,       setEndDate]       = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterType,    setFilterType]    = useState<SaleType>('all');
  const [report,        setReport]        = useState<ReportSummary>(emptyReport);
  const [transactions,  setTransactions]  = useState<Transaction[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let all = await getTransactions();

      // Date filter
      const today = format(new Date(), 'yyyy-MM-dd');
      if      (dateRange === 'today')  all = all.filter((t) => t.date === today);
      else if (dateRange === 'week')   all = all.filter((t) => parseISO(t.date) >= subDays(new Date(), 7));
      else if (dateRange === 'month')  all = all.filter((t) => parseISO(t.date) >= subDays(new Date(), 30));
      else if (dateRange === 'custom') all = all.filter((t) => t.date >= startDate && t.date <= endDate);

      // Type filter
      if (filterType !== 'all') all = all.filter((t) => t.type === filterType);

      const sorted = all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(sorted);
      setReport(buildSummary(sorted));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  }, [dateRange, startDate, endDate, filterType]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handlePrint = () => {
    const typeLabel =
      filterType === 'all'       ? 'All Sales'       :
      filterType === 'wholesale' ? 'Wholesale Sales' : 'Retail Sales';

    triggerPrint(buildPrintHTML(
      transactions,
      report,
      getDateRangeLabel(dateRange, startDate, endDate),
      typeLabel,
    ));
  };

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-orange-50 border border-orange-200 p-2 rounded-lg">
            <BarChart2 size={16} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Sales Reports</h3>
            <p className="text-gray-400 text-xs">View and export transaction history</p>
          </div>
        </div>
        <Button
          variant="primary"
          color="orange"
          size="sm"
          icon={<Printer className="w-3.5 h-3.5" />}
          onClick={handlePrint}
          disabled={transactions.length === 0}
        >
          Print Report
        </Button>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <ReportFilters
        dateRange={dateRange}
        startDate={startDate}
        endDate={endDate}
        filterType={filterType}
        onDateRangeChange={setDateRange}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onFilterTypeChange={setFilterType}
      />

      <SummaryCards
        report={report}
        rangeLabel={getDateRangeLabel(dateRange, startDate, endDate)}
        filterType={filterType}
      />

      <TransactionsTable
        transactions={transactions}
        report={report}
        loading={loading}
        onPrint={handlePrint}
      />
    </div>
  );
};

export default SalesReport;