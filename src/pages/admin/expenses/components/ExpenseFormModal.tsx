import React from 'react';
import { Expense, ExpenseBatch, Product } from '@/types';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Field from '@/components/common/Field';
import { ExpenseFormData, ExpenseMode } from './useExpenses';

const inputCls = `w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
  text-gray-900 placeholder-gray-400 text-sm
  focus:outline-none focus:bg-white focus:border-orange-400
  focus:ring-2 focus:ring-orange-100 transition-all`;

interface ExpenseFormModalProps {
  open:         boolean;
  editing:      Expense | null;
  form:         ExpenseFormData;
  products:     Product[];
  batches:      ExpenseBatch[];
  loading:      boolean;
  onChange:     (key: keyof ExpenseFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onModeChange: (mode: ExpenseMode) => void;
  onClose:      () => void;
  onSubmit:     () => void;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  open,
  editing,
  form,
  products,
  batches,
  loading,
  onChange,
  onModeChange,
  onClose,
  onSubmit,
}) => {
  const isBatch     = form.mode === 'inventory_batch';
  const selectedBatch = batches.find((batch) => batch.id === form.batchId);
  const isExistingBatch = isBatch && !!form.batchId;
  const batchAmount = Number.parseInt(form.quantity || '0', 10) * Number(form.unitCost || '0');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Expense' : 'Add Expense'}
      maxWidth="xl"
      persistent={loading}
    >
      <div className="space-y-4">
        {/* Mode toggle — only shown when creating */}
        {!editing && (
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
            {(['custom', 'inventory_batch'] as ExpenseMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onModeChange(mode)}
                className={`py-2 rounded-md text-sm font-semibold transition-colors ${
                  form.mode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {mode === 'custom' ? 'Custom' : 'Batch'}
              </button>
            ))}
          </div>
        )}

        {/* Batch-specific fields */}
        {isBatch && !editing && (
          <div className="space-y-4">
            <Field label="Existing Batch">
              <select
                value={form.batchId}
                onChange={onChange('batchId')}
                disabled={loading}
                className={inputCls}
              >
                <option value="">Create a new batch from this expense</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {(batch.name || 'Unnamed batch')} - {batch.productName ?? 'Product'} - GH₵{batch.totalCost?.toFixed(2) ?? '0.00'}
                  </option>
                ))}
              </select>
            </Field>

            {selectedBatch && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                {selectedBatch.quantity} units of {selectedBatch.productName ?? 'selected product'}
                {selectedBatch.supplier ? ` from ${selectedBatch.supplier}` : ''}
              </div>
            )}

            {!isExistingBatch && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Batch Name">
                  <input
                    type="text"
                    value={form.batchName}
                    onChange={onChange('batchName')}
                    disabled={loading}
                    className={inputCls}
                    placeholder="e.g. May supplement delivery"
                  />
                </Field>

                <Field label="Product">
              <select
                value={form.productId}
                onChange={onChange('productId')}
                disabled={loading}
                className={inputCls}
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
                </Field>

                <Field label="Supplier">
              <input
                type="text"
                value={form.supplier}
                onChange={onChange('supplier')}
                disabled={loading}
                className={inputCls}
                placeholder="Supplier name"
              />
                </Field>

                <Field label="Quantity">
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={onChange('quantity')}
                disabled={loading}
                className={inputCls}
                placeholder="0"
              />
                </Field>

                <Field label="Unit Cost">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={onChange('unitCost')}
                disabled={loading}
                className={inputCls}
                placeholder="0.00"
              />
                </Field>

                <Field label="Expiry Date">
              <input
                type="date"
                value={form.expiryDate}
                onChange={onChange('expiryDate')}
                disabled={loading}
                className={inputCls}
              />
                </Field>

                <Field label="Batch Total">
              <input
                type="text"
                value={`GH₵${batchAmount.toFixed(2)}`}
                disabled
                className={`${inputCls} text-gray-500`}
              />
                </Field>
              </div>
            )}
          </div>
        )}

        {/* Shared fields */}
        <Field label="Description">
          <input
            type="text"
            value={form.description}
            onChange={onChange('description')}
            disabled={loading}
            className={inputCls}
            placeholder={isBatch ? 'Inventory purchase' : 'Electric bill'}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(!isBatch || isExistingBatch) && (
            <Field label="Amount">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={onChange('amount')}
                disabled={loading}
                className={inputCls}
                placeholder={isExistingBatch ? 'Use batch total if blank' : '0.00'}
              />
            </Field>
          )}
          <Field label="Category">
            <input
              type="text"
              value={form.category}
              onChange={onChange('category')}
              disabled={loading}
              className={inputCls}
              placeholder={isBatch ? 'Inventory' : 'Utilities'}
            />
          </Field>
        </div>

        <Field label="Note">
          <textarea
            value={form.note}
            onChange={onChange('note')}
            disabled={loading}
            className={`${inputCls} min-h-24 resize-none`}
            placeholder="Optional note"
          />
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="md" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            color="orange"
            size="md"
            fullWidth
            loading={loading}
            onClick={onSubmit}
          >
            {editing ? 'Update Expense' : 'Save Expense'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExpenseFormModal;
