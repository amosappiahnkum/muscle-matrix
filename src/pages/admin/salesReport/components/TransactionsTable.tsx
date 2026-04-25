import React from 'react';
import { format, parseISO } from 'date-fns';
import { Printer, FileDown, ShoppingCart, Receipt } from 'lucide-react';
import { Transaction } from '@/types';
import DataTable, { Column } from '@/components/common/DataTable.tsx';
import Button from '@/components/common/Button.tsx';
import { ReportSummary } from '@/types';

interface TransactionsTableProps {
  transactions: Transaction[];
  report:       ReportSummary;
  loading:      boolean;
  onPrint:      () => void;
}

const TypeBadge: React.FC<{ type: 'wholesale' | 'retail' }> = ({ type }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
    type === 'wholesale'
      ? 'bg-blue-50 text-blue-600 border-blue-200'
      : 'bg-green-50 text-green-600 border-green-200'
  }`}>
    {type.toUpperCase()}
  </span>
);

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions, report, loading, onPrint,
}) => {
  const columns: Column<Transaction>[] = [
    {
      key: 'index', header: '#',
      render: (_, i) => <span className="text-gray-400 text-xs">{(i ?? 0) + 1}</span>,
      width: '40px',
    },
    {
      key: 'receiptNumber', header: 'Receipt No.',
      render: (t) => <span className="text-gray-700 font-mono text-xs">{t.receiptNumber}</span>,
    },
    {
      key: 'customerName', header: 'Customer',
      render: (t) => <span className="text-gray-700 text-sm font-medium">{t.customerName}</span>,
    },
    {
      key: 'type', header: 'Type',
      render: (t) => <TypeBadge type={t.type} />,
    },
    {
      key: 'employeeName', header: 'Employee',
      render: (t) => <span className="text-gray-400 text-xs">{t.employeeName}</span>,
    },
    {
      key: 'items', header: 'Items',
      render: (t) => (
        <span className="text-gray-400 text-xs max-w-[180px] block truncate">
          {t.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
        </span>
      ),
    },
    {
      key: 'totalAmount', header: 'Amount', align: 'right',
      render: (t) => (
        <span className="text-orange-500 font-semibold text-sm">GH₵{t.totalAmount.toFixed(2)}</span>
      ),
    },
    {
      key: 'createdAt', header: 'Date & Time',
      render: (t) => (
        <span className="text-gray-400 text-xs tabular-nums">
          {format(parseISO(t.createdAt), 'dd MMM yyyy HH:mm')}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

      {/* Table header */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={14} className="text-orange-400" />
          <span className="text-sm font-semibold text-gray-800">Transaction Details</span>
          <span className="text-xs text-gray-400">({transactions.length})</span>
        </div>
        <Button
          variant="ghost"
          color="orange"
          size="sm"
          icon={<Printer size={13} />}
          onClick={onPrint}
          disabled={transactions.length === 0}
        >
          Print / Export PDF
        </Button>
      </div>

      {/* Empty state */}
      {!loading && transactions.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium text-gray-400">No transactions found</p>
          <p className="text-xs mt-1 text-gray-300">Try adjusting the date range or filters.</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={transactions}
            keyExtractor={(t) => t.id}
            loading={loading}
          />

          {/* Grand total */}
          {!loading && transactions.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex justify-between items-center">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                Grand Total — {transactions.length} transactions
              </span>
              <span className="text-orange-500 font-bold text-sm tabular-nums">
                GH₵{report.totalSales.toFixed(2)}
              </span>
            </div>
          )}

          {/* Bottom print hint */}
          {!loading && transactions.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <FileDown size={13} className="text-orange-400 shrink-0" />
                Use browser print-to-PDF after clicking Print Report.
              </p>
              <Button
                variant="primary"
                color="orange"
                size="sm"
                icon={<Printer size={13} />}
                onClick={onPrint}
              >
                Print Report ({transactions.length} records)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};