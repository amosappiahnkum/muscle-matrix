import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, FileText, X } from 'lucide-react';
import { Transaction } from '@/types';
import { deleteTransaction, getTransactions } from '@/api/api';
import { printReceipt } from '@/pages/sales/ReceiptPrinter';
import { ErrorBanner } from '../../../components/common/Banner';

import PageLayout from '@/components/admin-layouts/PageLayouts';
import TransactionFilters, { SaleType } from './components/TransactionFilters';
import TransactionTable                 from './components/TransactionTable';
import TransactionDetailModal           from './components/TransactionDetailModal';
import DeleteTransactionModal           from './components/DeleteTransactionModal';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [typeFilter,   setTypeFilter]   = useState<SaleType>('all');
  const [selected,     setSelected]     = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deletingId,   setDeletingId]   = useState<string | null>(null);
  const [success,      setSuccess]      = useState('');

  const flash = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

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

  const filtered = useMemo(() => {
    let result = transactions;
    if (typeFilter !== 'all') result = result.filter((t) => t.type === typeFilter);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    setError('');
    try {
      await deleteTransaction(deleteTarget.id);
      setTransactions((current) => current.filter((t) => t.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      flash('Sale deleted and stock restored successfully.');
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
  <PageLayout
  title="Transaction History"
  subtitle="All recorded sales transactions"
  icon={<FileText size={16} className="text-orange-500" />}
>

  {/* Alerts */}
  {error && (
    <ErrorBanner
      message={error}
      onDismiss={() => setError('')}
    />
  )}

  {success && (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-3 text-green-700 shadow-lg">
      <CheckCircle className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{success}</span>
      <button
        onClick={() => setSuccess('')}
        className="ml-2 rounded-md p-1 text-green-500 hover:bg-green-50 hover:text-green-700 transition-colors"
        aria-label="Dismiss success message"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )}

  {/* Filters */}
  <TransactionFilters
    searchQuery={searchQuery}
    typeFilter={typeFilter}
    filteredCount={filtered.length}
    onSearchChange={setSearchQuery}
    onTypeChange={setTypeFilter}
  />

  {/* Table */}
  <TransactionTable
    transactions={filtered}
    searchQuery={searchQuery}
    typeFilter={typeFilter}
    loading={loading || !!deletingId}
    onView={setSelected}
    onPrint={printReceipt}
    onDelete={setDeleteTarget}
  />

  {/* Modal */}
  <TransactionDetailModal
    transaction={selected}
    onClose={() => setSelected(null)}
  />

  <DeleteTransactionModal
    transaction={deleteTarget}
    loading={!!deletingId}
    onConfirm={handleDelete}
    onCancel={() => setDeleteTarget(null)}
  />

</PageLayout>
  );
};

export default TransactionHistory;
