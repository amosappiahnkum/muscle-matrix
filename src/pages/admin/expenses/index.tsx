import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ReceiptText } from 'lucide-react';
import { Expense } from '@/types';
import { ErrorBanner, SuccessBanner } from '@/components/common/Banner';
import Button from '@/components/common/Button';
import { useExpenses } from './components/useExpenses';
import ExpenseSummaryCards from './components/ExpenseSummaryCards';
import ExpenseTableFilters from './components/ExpenseTableFilters';
import ExpenseTable from './components/ExpenseTable';
import ExpenseViewModal from './components/ExpenseViewModal';

const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    expenses, filtered, totals,
    loading, error, success, search, typeFilter,
    setSearch, setTypeFilter, setError, setSuccess,
    handleDelete,
  } = useExpenses();

  const [viewing, setViewing] = useState<Expense | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-xl">
            <ReceiptText size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
            <p className="text-gray-400 text-sm">{expenses.length} expense records</p>
          </div>
        </div>
        <Button
          variant="primary"
          color="orange"
          icon={<Plus size={16} />}
          onClick={() => navigate('/admin/expenses/new')}
        >
          Add Expense
        </Button>
      </div>

      {/* Summary cards */}
      <ExpenseSummaryCards
        total={totals.total}
        custom={totals.custom}
        batch={totals.batch}
      />

      {/* Banners */}
      {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}
      {error   && <ErrorBanner   message={error}   onDismiss={() => setError('')}   />}

      {/* Table + filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <ExpenseTableFilters
          search={search}
          typeFilter={typeFilter}
          onSearch={setSearch}
          onTypeFilter={setTypeFilter}
        />
        <ExpenseTable
          data={filtered}
          loading={loading}
          onView={setViewing}
          onEdit={(expense) => navigate(`/admin/expenses/${expense.id}/edit`)}
          onDelete={handleDelete}
        />
      </div>

      {/* View modal */}
      <ExpenseViewModal
        expense={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
};

export default ExpensesPage;