import React, { useState, useEffect, useCallback } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Printer, BarChart2 } from 'lucide-react';
import { Transaction } from '@/types';
import { getTransactions } from '@/api/api.ts';
import Button from '../../../components/common/Button.tsx';
import { ErrorBanner } from '../../../components/common/Banner.tsx';

import { SaleType, ReportSummary, emptyReport } from '@/types';
import { getDateRangeLabel, buildSummary }       from './components/helpers.tsx';
import { buildPrintHTML, triggerPrint }          from './components/printBuilder.tsx';
import { ReportFilters }                         from './components/ReportFilters.tsx';
import { SummaryCards }                          from './components/SummaryCards.tsx';
import { TransactionsTable }                     from './components/TransactionsTable.tsx';

const SalesReport: React.FC = () => {
  const [dateValue,    setDateValue]    = useState<[Dayjs, Dayjs] | null>([dayjs().startOf('day'), dayjs().endOf('day')]);
  const [filterType,   setFilterType]   = useState<SaleType>('all');
  const [report,       setReport]       = useState<ReportSummary>(emptyReport);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let all = await getTransactions();

      if (dateValue) {
        const startStr = dateValue[0].format('YYYY-MM-DD');
        const endStr   = dateValue[1].format('YYYY-MM-DD');
        all = all.filter((t) => t.date >= startStr && t.date <= endStr);
      }

      if (filterType !== 'all') all = all.filter((t) => t.type === filterType);

      const sorted = all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(sorted);
      setReport(buildSummary(sorted));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  }, [dateValue, filterType]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handlePrint = () => {
    const typeLabel =
      filterType === 'all'       ? 'All Sales'       :
      filterType === 'wholesale' ? 'Wholesale Sales' : 'Retail Sales';

    triggerPrint(buildPrintHTML(
      transactions,
      report,
      getDateRangeLabel(dateValue),
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
        dateValue={dateValue}
        filterType={filterType}
        onDateChange={setDateValue}
        onFilterTypeChange={setFilterType}
      />

      <SummaryCards
        report={report}
        rangeLabel={getDateRangeLabel(dateValue)}
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
