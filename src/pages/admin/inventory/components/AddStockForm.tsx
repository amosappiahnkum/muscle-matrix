import React, { useState, useEffect } from 'react';
import { ChevronUp, Plus, X } from 'lucide-react';
import { Product } from '@/types';
import Button from '@/components/common/Button';
import { ErrorBanner } from '@/components/common/Banner';
import { StockLevel } from './StockLevel';

interface Batch {
  id:   string;
  name?: string | null;
  batchCode: string;
}

interface ProductLine {
  productId:  string;
  quantity:   string;
  unitCost:   string;
  expiryDate: string;
}

const emptyLine = (): ProductLine => ({
  productId: '', quantity: '', unitCost: '', expiryDate: '',
});

interface AddStockFormProps {
  open:           boolean;
  products:       Product[];
  batches:        Batch[];
  loading:        boolean;
  error:          string;
  preselectedId?: string;
  onClose:        () => void;
  /** Show the internal collapsible header (default true). Set false when used on a dedicated page. */
  showHeader?:    boolean;
  onSubmit: (payload: {
    products: { productId: string; quantity: number; unitCost?: number; expiry_date?: string }[];
    note: string;
    createBatch: boolean;
    batchDescription: string;
    existingBatchId: string;
    supplier: string;
    expiry_date: string;
  }) => void;
}

const inputCls = `w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
  text-sm focus:outline-none focus:bg-white focus:border-orange-400
  focus:ring-2 focus:ring-orange-100 transition-all`;

export const AddStockForm: React.FC<AddStockFormProps> = ({
  open,
  products,
  batches,
  loading,
  error,
  preselectedId,
  onClose,
  showHeader = true,
  onSubmit,
}) => {
  const [lines, setLines]               = useState<ProductLine[]>([emptyLine()]);
  const [note, setNote]                 = useState('');
  const [expiryDate, setExpiryDate]     = useState('');
  const [createBatch, setCreateBatch]   = useState(false);
  const [batchDescription, setBatchDescription] = useState('');
  const [existingBatchId, setExistingBatchId]    = useState('');
  const [supplier, setSupplier]         = useState('');

  // Reset form when opened
  useEffect(() => {
    if (!open) return;

    const first = emptyLine();
    if (preselectedId) first.productId = preselectedId;

    setLines([first]);
    setNote('');
    setExpiryDate('');
    setCreateBatch(false);
    setBatchDescription('');
    setExistingBatchId('');
    setSupplier('');
  }, [open, preselectedId]);

  if (!open) return null;

  const updateLine = (index: number, field: keyof ProductLine, value: string) =>
    setLines(cur => cur.map((l, i) => i === index ? { ...l, [field]: value } : l));

  const addLine = () => setLines(cur => [...cur, emptyLine()]);
  const removeLine = (index: number) => setLines(cur => cur.filter((_, i) => i !== index));

  const handleCreateBatchToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateBatch(e.target.checked);
    setExistingBatchId('');
  };

  const grandTotal = lines.reduce((sum, l) => {
    const qty  = Number.parseInt(l.quantity || '0', 10);
    const cost = Number(l.unitCost || '0');
    return sum + (Number.isNaN(qty) ? 0 : qty) * (Number.isNaN(cost) ? 0 : cost);
  }, 0);

  const handleSubmit = () => {
    onSubmit({
      products: lines.map(l => ({
        productId:   l.productId,
        quantity:    Number.parseInt(l.quantity || '0', 10),
        unitCost:    l.unitCost ? Number(l.unitCost) : undefined,
        expiry_date: l.expiryDate || undefined,
      })),
      note,
      createBatch,
      batchDescription,
      existingBatchId,
      supplier,
      expiry_date: expiryDate,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-800">Add Stock</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
            title="Collapse"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      )}

      <div className="p-5 space-y-5">
        {error && <ErrorBanner message={error} />}

        {/* Product lines */}
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-1">
            <span className="col-span-4">Product</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-2 text-right">Unit Cost</span>
            <span className="col-span-2">Expiry</span>
            <span className="col-span-2 text-right">Line Total</span>
          </div>

          {lines.map((line, i) => {
            const selected = products.find(p => p.id === line.productId);
            const qty  = Number.parseInt(line.quantity || '0', 10);
            const cost = Number(line.unitCost || '0');
            const lineTotal = (Number.isNaN(qty) ? 0 : qty) * (Number.isNaN(cost) ? 0 : cost);

            return (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                {/* Product */}
                <div className="col-span-4">
                  <select
                    value={line.productId}
                    onChange={(e) => updateLine(i, 'productId', e.target.value)}
                    disabled={loading}
                    className={inputCls}
                  >
                    <option value="">Select product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — stock: {p.quantity}
                      </option>
                    ))}
                  </select>
                  {selected && (
                    <div className="mt-1 px-1">
                      <StockLevel qty={selected.quantity} />
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => updateLine(i, 'quantity', e.target.value)}
                    disabled={loading}
                    className={`${inputCls} text-center`}
                    placeholder="0"
                  />
                </div>

                {/* Unit cost */}
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unitCost}
                    onChange={(e) => updateLine(i, 'unitCost', e.target.value)}
                    disabled={loading}
                    className={`${inputCls} text-right`}
                    placeholder={selected ? selected.costPrice.toFixed(2) : '0.00'}
                  />
                </div>

                {/* Expiry */}
                <div className="col-span-2">
                  <input
                    type="date"
                    value={line.expiryDate}
                    onChange={(e) => updateLine(i, 'expiryDate', e.target.value)}
                    disabled={loading}
                    className={inputCls}
                  />
                </div>

                {/* Line total + remove */}
                <div className="col-span-2 flex items-center gap-1">
                  <input
                    type="text"
                    value={`GH₵${lineTotal.toFixed(2)}`}
                    disabled
                    className={`${inputCls} text-right text-gray-500`}
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    disabled={loading || lines.length === 1}
                    title="Remove row"
                    className="w-8 h-9 flex items-center justify-center rounded-lg text-gray-400
                      hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed
                      transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addLine}
            disabled={loading}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold
              disabled:opacity-40 transition-colors inline-flex items-center gap-1"
          >
            <Plus size={13} /> Add another product
          </button>

          <div className="flex justify-end pt-1">
            <span className="text-sm text-gray-500 mr-2">Grand Total:</span>
            <span className="text-sm font-semibold text-gray-900">GH₵{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Shared expiry (fallback for lines without their own) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Default Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={loading}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">Used for lines without their own expiry date</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Note</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Supplier delivery..."
              disabled={loading}
              className={inputCls}
            />
          </div>
        </div>

        {/* Batch section */}
        <div className="border border-gray-200 rounded-xl p-4 space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={createBatch}
              onChange={handleCreateBatchToggle}
              disabled={loading}
            />
            Create New Batch
          </label>

          {!createBatch && (
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-600">
                Add To Existing Batch
              </label>
              <select
                value={existingBatchId}
                onChange={(e) => setExistingBatchId(e.target.value)}
                disabled={loading}
                className={inputCls}
              >
                <option value="">Select batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name || 'Unnamed batch'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {createBatch && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-600">
                  Batch Description
                </label>
                <input
                  type="text"
                  value={batchDescription}
                  onChange={(e) => setBatchDescription(e.target.value)}
                  placeholder="May whey shipment"
                  disabled={loading}
                  className={inputCls}
                />
                <p className="text-xs text-gray-400 mt-1">Batch code will generate automatically</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Supplier</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Supplier name"
                  disabled={loading}
                  className={inputCls}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            color="orange"
            fullWidth
            loading={loading}
            onClick={handleSubmit}
          >
            Add Stock
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddStockForm;