import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { Transaction } from '@/types';
import { getTransactions } from '@/api/api';
import { printReceipt } from '@/pages/sales/ReceiptPrinter';
import { ErrorBanner } from '../../../components/common/Banner';

import PageLayout from '@/components/admin-layouts/PageLayouts';
import TransactionFilters, { SaleType } from './components/TransactionFilters';
import TransactionTable                 from './components/TransactionTable';
import TransactionDetailModal           from './components/TransactionDetailModal';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [typeFilter,   setTypeFilter]   = useState<SaleType>('all');
  const [selected,     setSelected]     = useState<Transaction | null>(null);

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
    loading={loading}
    searchQuery={searchQuery}
    typeFilter={typeFilter}
    onView={setSelected}
    onPrint={printReceipt}
  />

  {/* Modal */}
  <TransactionDetailModal
    transaction={selected}
    onClose={() => setSelected(null)}
  />

</PageLayout>
  );
};

export default TransactionHistory;