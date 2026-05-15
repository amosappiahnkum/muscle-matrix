import React from 'react';
import { Plus, ReceiptText } from 'lucide-react';
import { ErrorBanner, SuccessBanner } from '@/components/common/Banner';
import Button from '@/components/common/Button';
import { useExpenses } from './components/useExpenses';
import ExpenseSummaryCards from './components/ExpenseSummaryCards';
import ExpenseTableFilters from './components/ExpenseTableFilters';
import ExpenseTable from './components/ExpenseTable';
import ExpenseFormModal from './components/ExpenseFormModal';

const ExpensesPage: React.FC = () => {
  const {
    expenses, products, batches, filtered, totals,
    loading, saving, error, success, search, typeFilter, formOpen, editing, form,
    setSearch, setTypeFilter, setError, setSuccess, setField, onModeChange,
    openCreate, openEdit, closeForm, handleSubmit, handleDelete,
  } = useExpenses();

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

        <Button variant="primary" color="orange" icon={<Plus size={16} />} onClick={openCreate}>
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
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Create / edit modal */}
      <ExpenseFormModal
        open={formOpen}
        editing={editing}
        form={form}
        products={products}
        batches={batches}
        loading={saving}
        onChange={setField}
        onModeChange={onModeChange}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ExpensesPage;
