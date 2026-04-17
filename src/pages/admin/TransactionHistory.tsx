// src/components/admin-layouts/TransactionHistory.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Eye, Printer, FileText } from 'lucide-react';
import { Transaction } from '@/types';
import { getTransactions } from '@/api/api.ts';
import { printReceipt } from '@/pages/sales/ReceiptPrinter.ts';
import DataTable, { Column } from '../../components/common/DataTable.tsx';
import { ErrorBanner } from '../../components/common/Banner.tsx';
import TransactionDetailModal from '@/pages/admin/transactions/TransactionDetailModal.tsx';
import TransactionFilters from '@/pages/admin/transactions/TransactionFilters.tsx';

type SaleType = 'all' | 'wholesale' | 'retail';

// ─── Type badge ───────────────────────────────────────────────────────────────
const TypeBadge: React.FC<{ type: 'wholesale' | 'retail' }> = ({ type }) => (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
        type === 'wholesale'
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-green-500/20 text-green-400'
    }`}>
    {type}
  </span>
);

// ─── Main component ───────────────────────────────────────────────────────────
const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [typeFilter,   setTypeFilter]   = useState<SaleType>('all');
  const [selected,     setSelected]     = useState<Transaction | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const all = await getTransactions();
      setTransactions(
          all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Client-side filter (no extra API call) ────────────────────────────────
  const filtered = useMemo(() => {
    let result = transactions;

    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
          (t) =>
              t.receiptNumber.toLowerCase().includes(q) ||
              t.customerName.toLowerCase().includes(q)  ||
              t.employeeName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [transactions, typeFilter, searchQuery]);

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns: Column<Transaction>[] = [
    {
      key: 'receiptNumber', header: 'Receipt #',
      render: (t) => (
          <span className="text-white font-mono text-xs">{t.receiptNumber}</span>
      ),
    },
    {
      key: 'customerName', header: 'Customer',
      render: (t) => <span className="text-white">{t.customerName}</span>,
    },
    {
      key: 'type', header: 'Type',
      render: (t) => <TypeBadge type={t.type} />,
    },
    {
      key: 'items', header: 'Items', align: 'center',
      render: (t) => (
          <span className="text-gray-400 text-sm">{t.items.length}</span>
      ),
    },
    {
      key: 'employeeName', header: 'Employee',
      render: (t) => <span className="text-gray-400 text-sm">{t.employeeName}</span>,
    },
    {
      key: 'totalAmount', header: 'Amount', align: 'right',
      render: (t) => (
          <span className="text-orange-400 font-semibold">
          GH₵{t.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'createdAt', header: 'Date',
      render: (t) => (
          <span className="text-gray-400 text-sm">
          {format(parseISO(t.createdAt), 'MMM dd, HH:mm')}
        </span>
      ),
    },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (t) => (
          <div className="flex justify-end gap-2">
            <button
                onClick={() => setSelected(t)}
                title="View Details"
                className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
                onClick={() => printReceipt(t)}
                title="Print Receipt"
                className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
      ),
    },
  ];

  return (
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold text-white">Transaction History</h3>
          <TransactionFilters
              searchQuery={searchQuery}
              typeFilter={typeFilter}
              onSearchChange={setSearchQuery}
              onTypeChange={setTypeFilter}
          />
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {/* Table */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          {!loading && filtered.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">
                  {searchQuery || typeFilter !== 'all'
                      ? 'No transactions match your filters.'
                      : 'No transactions recorded yet.'}
                </p>
              </div>
          ) : (
              <DataTable
                  columns={columns}
                  data={filtered}
                  keyExtractor={(t) => t.id}
                  loading={loading}
                  emptyMessage="No transactions found."
              />
          )}
        </div>

        {/* Detail modal */}
        <TransactionDetailModal
            transaction={selected}
            onClose={() => setSelected(null)}
        />
      </div>
  );
};

export default TransactionHistory;