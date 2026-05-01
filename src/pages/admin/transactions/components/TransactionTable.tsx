import React from 'react';
import { format, parseISO } from 'date-fns';
import { Eye, Printer, FileText } from 'lucide-react';
import { Transaction } from '@/types';
import DataTable, { Column } from '@/components/common/DataTable';

interface TransactionTableProps {
  transactions: Transaction[];
  loading:      boolean;
  searchQuery:  string;
  typeFilter:   string;
  onView:       (t: Transaction) => void;
  onPrint:      (t: Transaction) => void;
}

const TypeBadge: React.FC<{ type: 'wholesale' | 'retail' }> = ({ type }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${
    type === 'wholesale'
      ? 'bg-blue-50 text-blue-600 border-blue-200'
      : 'bg-green-50 text-green-600 border-green-200'
  }`}>
    {type}
  </span>
);

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions, loading, searchQuery, typeFilter, onView, onPrint,
}) => {
  const columns: Column<Transaction>[] = [
    {
      key: 'receiptNumber', header: 'Receipt #',
      render: (t) => (
        <span className="text-gray-800 font-mono text-xs">{t.receiptNumber}</span>
      ),
    },
    {
      key: 'customerName', header: 'Customer',
      render: (t) => <span className="text-gray-800 text-sm font-medium">{t.customerName}</span>,
    },
    {
      key: 'type', header: 'Type',
      render: (t) => <TypeBadge type={t.type} />,
    },
    {
      key: 'items', header: 'Items', align: 'center',
      render: (t) => (
        <span className="text-gray-400 text-xs tabular-nums">{t.items.length}</span>
      ),
    },
    {
      key: 'employeeName', header: 'Employee',
      render: (t) => <span className="text-gray-400 text-xs">{t.employeeName}</span>,
    },
    {
      key: 'totalAmount', header: 'Amount', align: 'right',
      render: (t) => (
        <span className="text-orange-500 font-semibold text-sm tabular-nums">
          GH₵{t.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'createdAt', header: 'Date',
      render: (t) => (
        <span className="text-gray-400 text-xs tabular-nums">
          {format(parseISO(t.createdAt), 'dd MMM, HH:mm')}
        </span>
      ),
    },
    {
      key: 'actions', header: '', align: 'right',
      render: (t) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => onView(t)}
            title="View Details"
            className="p-1.5 bg-blue-50 text-blue-500 rounded-lg border border-blue-100
              hover:bg-blue-100 transition-colors"
          >
            <Eye size={13} />
          </button>
          <button
            onClick={() => onPrint(t)}
            title="Print Receipt"
            className="p-1.5 bg-green-50 text-green-500 rounded-lg border border-green-100
              hover:bg-green-100 transition-colors"
          >
            <Printer size={13} />
          </button>
        </div>
      ),
    },
  ];

  if (!loading && transactions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm py-14 text-center">
        <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-2xl
          flex items-center justify-center mx-auto mb-3">
          <FileText size={20} className="text-gray-300" />
        </div>
        <p className="text-gray-500 text-sm font-medium">No transactions found</p>
        <p className="text-gray-400 text-xs mt-1">
          {searchQuery || typeFilter !== 'all'
            ? 'No transactions match your filters.'
            : 'No transactions recorded yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <DataTable
        columns={columns}
        data={transactions}
        keyExtractor={(t) => t.id}
        loading={loading}
      />
    </div>
  );
};

export default TransactionTable;