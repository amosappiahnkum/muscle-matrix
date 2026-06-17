import React from 'react';
import { format, parseISO } from 'date-fns';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { Expense } from '@/types';
import DataTable, { Column } from '@/components/common/DataTable';

const typeLabel: Record<string, string> = {
  custom:          'Custom',
  inventory_batch: 'Batch',
};

interface ExpenseTableProps {
  data:     Expense[];
  loading:  boolean;
  onView:   (expense: Expense) => void;
  onEdit:   (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ data, loading, onView, onEdit, onDelete }) => {
  const columns: Column<Expense>[] = [
    {
      key: 'description',
      header: 'Expense',
      render: (expense) =>
        expense.type === 'inventory_batch' && expense.batch ? (
          <div>
            {/* Batch name is the primary label */}
            <p className="font-semibold text-gray-900">
              {expense.batch.name ?? 'Unnamed Batch'}
            </p>
            {/* Description is secondary */}
            <p className="text-xs text-gray-400">{expense.description}</p>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-gray-900">{expense.description}</p>
            <p className="text-xs text-gray-400">{expense.category ?? 'General'}</p>
          </div>
        ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (expense) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${
          expense.type === 'inventory_batch'
            ? 'bg-blue-50 text-blue-600 border-blue-100'
            : 'bg-gray-50 text-gray-600 border-gray-200'
        }`}>
          {typeLabel[expense.type]}
        </span>
      ),
    },
    {
      key: 'batch',
      header: 'Batch Details',
      render: (expense) =>
        expense.batch ? (
          <div className="text-xs text-gray-500 space-y-0.5">
            {/* Product lines */}
            {expense.batch.products && expense.batch.products.length > 0 ? (
              expense.batch.products.slice(0, 2).map((p) => (
                <p key={p.productId}>
                  {p.productName ?? 'Product'} × {p.quantity}
                </p>
              ))
            ) : (
              <p>{expense.batch.productName ?? 'Product'} × {expense.batch.quantity}</p>
            )}
            {/* Show "+N more" if more than 2 products */}
            {expense.batch.products && expense.batch.products.length > 2 && (
              <p className="text-orange-400 font-medium">
                +{expense.batch.products.length - 2} more
              </p>
            )}
            {expense.batch.supplier && (
              <p className="text-gray-400">{expense.batch.supplier}</p>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (expense) => (
        <span className="font-bold text-orange-500 tabular-nums">
          GH₵{expense.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (expense) => (
        <span className="text-xs text-gray-500">
          {format(parseISO(expense.createdAt), 'dd MMM yyyy, HH:mm')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (expense) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => onView(expense)}
            title="View expense"
            className="p-1.5 bg-orange-50 text-orange-500 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onEdit(expense)}
            title="Edit expense"
            className="p-1.5 bg-blue-50 text-blue-500 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(expense)}
            title="Delete expense"
            className="p-1.5 bg-red-50 text-red-500 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      keyExtractor={(expense) => expense.id}
      loading={loading}
      emptyMessage="No expenses found."
    />
  );
};

export default ExpenseTable;