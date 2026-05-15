import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import Modal from '@/components/common/Modal.tsx';
import Button from '@/components/common/Button.tsx';
import { ErrorBanner } from '@/components/common/Banner.tsx';
import { StockLevel } from './StockLevel';

interface Batch {
  id: string;
  batchCode: string;
}

interface AddStockModalProps {
  open: boolean;
  products: Product[];
  loading: boolean;
  error: string;
  batches: Batch[];
  preselectedId?: string;
  onClose: () => void;
  onSubmit: (
    productId: string,
    quantity: number,
    note: string,
    expiryDate: string,
    batch: {
      createBatch: boolean;
      batchDescription: string;
      existingBatchId: string;
      supplier: string;
    }
  ) => void;
}

const inputCls = `
  w-full px-4 py-2.5
  bg-gray-50
  border border-gray-200
  rounded-xl
  text-sm
  focus:outline-none
  focus:ring-2
  focus:ring-orange-100
  focus:border-orange-400
`;

export const AddStockModal: React.FC<AddStockModalProps> = ({
  open,
  products,
  loading,
  error,
  batches,
  preselectedId,
  onClose,
  onSubmit,
}) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [createBatch, setCreateBatch] = useState(false);
  const [batchDescription, setBatchDescription] = useState('');
  const [existingBatchId, setExistingBatchId] = useState('');
  const [supplier, setSupplier] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return;

    const existing = products.find((p) => p.id === preselectedId);

    setProductId(preselectedId ?? '');
    setQuantity('');
    setNote('');
    setExpiryDate(existing?.expiryDate ?? '');
    setCreateBatch(false);
    setBatchDescription('');
    setExistingBatchId('');
    setSupplier('');
  }, [open, preselectedId, products]);

  // Sync expiry date when product selection changes
  useEffect(() => {
    const existing = products.find((p) => p.id === productId);
    setExpiryDate(existing?.expiryDate ?? '');
  }, [productId, products]);

  const selected = products.find((p) => p.id === productId);

  const handleSubmit = () => {
    onSubmit(productId, parseInt(quantity), note, expiryDate, {
      createBatch,
      batchDescription,
      existingBatchId,
      supplier,
    });
  };

  const handleCreateBatchToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateBatch(e.target.checked);
    setExistingBatchId('');
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Stock" persistent={loading}>
      <div className="space-y-4">

        {error && <ErrorBanner message={error} />}

        {/* Product */}
        <div>
          <label className="block text-sm font-semibold mb-1">Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className={inputCls}
            disabled={loading}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — stock: {p.quantity}
              </option>
            ))}
          </select>
        </div>

        {/* Current Stock Level */}
        {selected && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
            <span className="text-xs text-gray-500">Current stock:</span>
            <StockLevel qty={selected.quantity} />
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-semibold mb-1">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-sm font-semibold mb-1">Expiry Date</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Batch Section */}
        <div className="border rounded-xl p-4 space-y-4">
          <label className="flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={createBatch}
              onChange={handleCreateBatchToggle}
            />
            Create New Batch
          </label>

          {!createBatch && (
            <div>
              <label className="block text-xs font-semibold mb-1">
                Add To Existing Batch
              </label>
              <select
                value={existingBatchId}
                onChange={(e) => setExistingBatchId(e.target.value)}
                className={inputCls}
              >
                <option value="">Select batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {(batch.name || 'Unnamed batch')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {createBatch && (
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Batch Description
                </label>
                <input
                  type="text"
                  value={batchDescription}
                  onChange={(e) => setBatchDescription(e.target.value)}
                  placeholder="May whey shipment"
                  className={inputCls}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Batch code will generate automatically
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Supplier name"
                  className={inputCls}
                />
              </div>
            </div>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold mb-1">Note</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Supplier delivery..."
            className={inputCls}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
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
    </Modal>
  );
};

export default AddStockModal;