import React from 'react';
import { format, parseISO } from 'date-fns';
import { Package, Tag, Calendar, User, FileText, Layers } from 'lucide-react';
import { Expense } from '@/types';
import Modal from '@/components/common/Modal';

interface ExpenseViewModalProps {
  expense: Expense | null;
  onClose: () => void;
}

const Row: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon, label, value,
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-gray-400">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm text-gray-800 font-medium">{value}</div>
    </div>
  </div>
);

const ExpenseViewModal: React.FC<ExpenseViewModalProps> = ({ expense, onClose }) => {
  if (!expense) return null;

  const isBatch = expense.type === 'inventory_batch';
  const batch   = expense.batch;

  return (
    <Modal
      open={!!expense}
      onClose={onClose}
      title=""
      maxWidth="lg"
    >
      <div className="space-y-5">

        {/* ── Top: batch name (if batch) or description ── */}
        {isBatch && batch ? (
          <div className="space-y-1">
            {/* Batch name — most prominent */}
            <div className="flex items-center gap-2">
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                bg-blue-50 text-blue-600 border border-blue-100">
                Batch
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {batch.name ?? 'Unnamed Batch'}
            </h2>
            <p className="text-sm text-gray-500">{expense.description}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                bg-gray-100 text-gray-600 border border-gray-200">
                Custom
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{expense.description}</h2>
          </div>
        )}

        {/* ── Amount ── */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-orange-600 font-medium">Total Amount</span>
          <span className="text-2xl font-bold text-orange-500 tabular-nums">
            GH₵{expense.amount.toFixed(2)}
          </span>
        </div>

        {/* ── Batch products ── */}
        {isBatch && batch && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Layers size={15} className="text-gray-400" />
              Products in this batch
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs font-semibold
                text-gray-500 border-b border-gray-100">
                <span className="col-span-5">Product</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Unit Cost</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              {/* Rows */}
              {batch.products && batch.products.length > 0 ? (
                batch.products.map((p) => (
                  <div
                    key={p.productId}
                    className="grid grid-cols-12 px-3 py-2.5 text-sm border-b
                      border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <span className="col-span-5 font-medium text-gray-800 truncate">
                      {p.productName ?? 'Product'}
                    </span>
                    <span className="col-span-2 text-center text-gray-600">{p.quantity}</span>
                    <span className="col-span-3 text-right text-gray-600">
                      GH₵{p.unitCost.toFixed(2)}
                    </span>
                    <span className="col-span-2 text-right font-semibold text-gray-800">
                      GH₵{p.totalCost.toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                /* Legacy single-product fallback */
                <div className="grid grid-cols-12 px-3 py-2.5 text-sm">
                  <span className="col-span-5 font-medium text-gray-800 truncate">
                    {batch.productName ?? expense.productName ?? 'Product'}
                  </span>
                  <span className="col-span-2 text-center text-gray-600">
                    {batch.quantity ?? '—'}
                  </span>
                  <span className="col-span-3 text-right text-gray-600">
                    {batch.unitCost != null ? `GH₵${batch.unitCost.toFixed(2)}` : '—'}
                  </span>
                  <span className="col-span-2 text-right font-semibold text-gray-800">
                    {batch.totalCost != null ? `GH₵${batch.totalCost.toFixed(2)}` : '—'}
                  </span>
                </div>
              )}
            </div>

            {/* Batch meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {batch.supplier && (
                <Row
                  icon={<User size={14} />}
                  label="Supplier"
                  value={batch.supplier}
                />
              )}
              {batch.expiryDate && (
                <Row
                  icon={<Calendar size={14} />}
                  label="Expiry Date"
                  value={format(parseISO(batch.expiryDate), 'dd MMM yyyy')}
                />
              )}
            </div>
          </div>
        )}

        {/* ── Custom expense details ── */}
        {!isBatch && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expense.category && (
              <Row
                icon={<Tag size={14} />}
                label="Category"
                value={expense.category}
              />
            )}
          </div>
        )}

        {/* ── Shared meta ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-100">
          {expense.category && isBatch && (
            <Row icon={<Tag size={14} />} label="Category" value={expense.category} />
          )}
          <Row
            icon={<Calendar size={14} />}
            label="Date"
            value={format(parseISO(expense.createdAt), 'dd MMM yyyy, HH:mm')}
          />
          {expense.createdBy && (
            <Row icon={<User size={14} />} label="Recorded by" value={expense.createdBy} />
          )}
          {expense.note && (
            <div className="sm:col-span-2">
              <Row icon={<FileText size={14} />} label="Note" value={expense.note} />
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
};

export default ExpenseViewModal;