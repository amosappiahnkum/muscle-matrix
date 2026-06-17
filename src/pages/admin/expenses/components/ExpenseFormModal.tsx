import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ReceiptText, Save } from 'lucide-react';
import { Product, ExpenseBatch, Expense } from '@/types';
import Button from '@/components/common/Button';
import Field from '@/components/common/Field';
import { ErrorBanner, SuccessBanner } from '@/components/common/Banner';
import { BatchProductEntry, ExpenseFormData, ExpenseMode } from './useExpenses';
import { getExpense } from '@/api/api';

const inputCls = `w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
  text-gray-900 placeholder-gray-400 text-sm
  focus:outline-none focus:bg-white focus:border-orange-400
  focus:ring-2 focus:ring-orange-100 transition-all`;

// ─── small sub-component: one product row ─────────────────────────────────────

interface ProductRowProps {
  row:       BatchProductEntry;
  index:     number;
  products:  Product[];
  canRemove: boolean;
  disabled:  boolean;
  onChange:  (field: keyof BatchProductEntry, value: string) => void;
  onRemove:  () => void;
}

const ProductRow: React.FC<ProductRowProps> = ({
  row, index, products, canRemove, disabled, onChange, onRemove,
}) => {
  const qty      = Number.parseInt(row.quantity || '0', 10);
  const cost     = Number(row.unitCost || '0');
  const rowTotal = (Number.isNaN(qty) ? 0 : qty) * (Number.isNaN(cost) ? 0 : cost);

  return (
    <div className="grid grid-cols-12 gap-2 items-end">
      <div className="col-span-12 sm:col-span-4">
        {index === 0 && (
          <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
        )}
        <select
          value={row.productId}
          onChange={e => onChange('productId', e.target.value)}
          disabled={disabled}
          className={inputCls}
        >
          <option value="">Select product</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="col-span-4 sm:col-span-2">
        {index === 0 && (
          <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
        )}
        <input
          type="number"
          min="1"
          value={row.quantity}
          onChange={e => onChange('quantity', e.target.value)}
          disabled={disabled}
          className={inputCls}
          placeholder="0"
        />
      </div>

      <div className="col-span-4 sm:col-span-3">
        {index === 0 && (
          <label className="block text-xs font-medium text-gray-600 mb-1">Unit Cost</label>
        )}
        <input
          type="number"
          min="0"
          step="0.01"
          value={row.unitCost}
          onChange={e => onChange('unitCost', e.target.value)}
          disabled={disabled}
          className={inputCls}
          placeholder="0.00"
        />
      </div>

      <div className="col-span-3 sm:col-span-2">
        {index === 0 && (
          <label className="block text-xs font-medium text-gray-600 mb-1">Total</label>
        )}
        <input
          type="text"
          value={`GH₵${rowTotal.toFixed(2)}`}
          disabled
          className={`${inputCls} text-gray-500`}
        />
      </div>

      <div className="col-span-1 flex items-end pb-0.5">
        {index === 0 && <div className="mb-1 h-4" />}
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled || !canRemove}
          title="Remove row"
          className="w-8 h-9 flex items-center justify-center rounded-lg text-gray-400
            hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// ─── page ───────────────────────────────────────────────────────────────────

interface ExpenseFormPageProps {
  editing:              Expense | null;
  form:                 ExpenseFormData;
  products:             Product[];
  batches:              ExpenseBatch[];
  loading:              boolean;
  error:                string;
  success:              string;
  onChange:             (key: keyof ExpenseFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onModeChange:         (mode: ExpenseMode) => void;
  onBatchProductChange: (index: number, field: keyof BatchProductEntry, value: string) => void;
  onAddBatchProduct:    () => void;
  onRemoveBatchProduct: (index: number) => void;
  onSubmit:             () => void;
  onCancel:             () => void;
  onDismissError:       () => void;
  onDismissSuccess:     () => void;
}

export const ExpenseFormPage: React.FC<ExpenseFormPageProps> = ({
  editing,
  form,
  products,
  batches,
  loading,
  error,
  success,
  onChange,
  onModeChange,
  onBatchProductChange,
  onAddBatchProduct,
  onRemoveBatchProduct,
  onSubmit,
  onCancel,
  onDismissError,
  onDismissSuccess,
}) => {
  const isBatch         = form.mode === 'inventory_batch';
  const selectedBatch   = batches.find(b => b.id === form.batchId);
  const isExistingBatch = isBatch && !!form.batchId;

  const grandTotal = form.batchProducts.reduce((sum, row) => {
    const qty  = Number.parseInt(row.quantity || '0', 10);
    const cost = Number(row.unitCost || '0');
    return sum + (Number.isNaN(qty) ? 0 : qty) * (Number.isNaN(cost) ? 0 : cost);
  }, 0);

  const showProductEditor = isBatch && (!editing || isExistingBatch);
  const showBatchMeta     = isBatch && !editing && !isExistingBatch;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          title="Back"
          className="p-2 rounded-xl border border-gray-200 text-gray-500
            hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-xl">
          <ReceiptText size={20} className="text-orange-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {editing ? 'Edit Expense' : 'Add Expense'}
          </h3>
          <p className="text-gray-400 text-sm">
            {editing ? 'Update the details of this expense' : 'Record a new expense or inventory purchase'}
          </p>
        </div>
      </div>

      {success && <SuccessBanner message={success} onDismiss={onDismissSuccess} />}
      {error   && <ErrorBanner   message={error}   onDismiss={onDismissError}   />}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">

        {/* ── Mode toggle (create only) ── */}
        {!editing && (
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
            {(['custom', 'inventory_batch'] as ExpenseMode[]).map(mode => (
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

        {/* ── Existing-batch selector (create only) ── */}
        {isBatch && !editing && (
          <>
            <Field label="Existing Batch">
              <select
                value={form.batchId}
                onChange={onChange('batchId')}
                disabled={loading}
                className={inputCls}
              >
                <option value="">Create a new batch from this expense</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name || 'Unnamed batch'} – {batch.productName ?? 'Product'} – GH₵{batch.totalCost?.toFixed(2) ?? '0.00'}
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
          </>
        )}

        {/* ── New-batch meta fields ── */}
        {showBatchMeta && (
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

            <Field label="Expiry Date">
              <input
                type="date"
                value={form.expiryDate}
                onChange={onChange('expiryDate')}
                disabled={loading}
                className={inputCls}
              />
            </Field>
          </div>
        )}

        {/* ── Multi-product rows ── */}
        {showProductEditor && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {editing ? 'Batch Products' : 'Products'}
              </span>
              <button
                type="button"
                onClick={onAddBatchProduct}
                disabled={loading}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold
                  disabled:opacity-40 transition-colors"
              >
                + Add product
              </button>
            </div>

            <div className="space-y-2">
              {form.batchProducts.map((row, i) => (
                <ProductRow
                  key={i}
                  index={i}
                  row={row}
                  products={products}
                  canRemove={form.batchProducts.length > 1}
                  disabled={loading}
                  onChange={(field, value) => onBatchProductChange(i, field, value)}
                  onRemove={() => onRemoveBatchProduct(i)}
                />
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <span className="text-sm text-gray-500 mr-2">Batch Total:</span>
              <span className="text-sm font-semibold text-gray-900">
                GH₵{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* ── Shared fields ── */}
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

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="md" fullWidth onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            color="orange"
            size="md"
            fullWidth
            icon={<Save size={16} />}
            loading={loading}
            onClick={onSubmit}
          >
            {editing ? 'Update Expense' : 'Save Expense'}
          </Button>
        </div>

      </div>
    </div>
  );
};

// ─── route wrapper ────────────────────────────────────────────────────────────

import { useExpenses } from './useExpenses';

const ExpenseFormRoute: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const {
    products, batches, saving, error, success, editing, form,
    setError, setSuccess, setField, onModeChange,
    openEdit, closeForm, handleSubmit,
    setBatchProductField, addBatchProduct, removeBatchProduct,
  } = useExpenses();

  const [pageLoading, setPageLoading] = useState(isEdit);
  const [loadError,   setLoadError]   = useState('');

  useEffect(() => {
    if (!isEdit || !id) return;

    setPageLoading(true);
    getExpense(id)
      .then((expense) => openEdit(expense))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load expense.'))
      .finally(() => setPageLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const handleCancel = () => {
    closeForm();
    navigate('/admin/expenses');
  };

  const handleSubmitAndRedirect = async () => {
    const ok = await handleSubmit();
    if (ok) {
      navigate('/admin/expenses');
    }
  };

  if (pageLoading) {
    return (
      <div className="py-10 text-center text-gray-400 text-sm">Loading expense...</div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4 max-w-3xl">
        <ErrorBanner message={loadError} />
        <Button variant="secondary" onClick={() => navigate('/admin/expenses')}>
          Back to Expenses
        </Button>
      </div>
    );
  }

  return (
    <ExpenseFormPage
      editing={editing}
      form={form}
      products={products}
      batches={batches}
      loading={saving}
      error={error}
      success={success}
      onChange={setField}
      onModeChange={onModeChange}
      onBatchProductChange={setBatchProductField}
      onAddBatchProduct={addBatchProduct}
      onRemoveBatchProduct={removeBatchProduct}
      onSubmit={handleSubmitAndRedirect}
      onCancel={handleCancel}
      onDismissError={() => setError('')}
      onDismissSuccess={() => setSuccess('')}
    />
  );
};

export default ExpenseFormRoute;