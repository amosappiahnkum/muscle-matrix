import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import Modal from '@/components/common/Modal.tsx';
import Button from '@/components/common/Button.tsx';
import { ErrorBanner } from '@/components/common/Banner.tsx';
import { StockLevel } from './StockLevel';

interface AddStockModalProps {
  open:           boolean;
  products:       Product[];
  loading:        boolean;
  error:          string;
  preselectedId?: string;
  onClose:        () => void;
  onSubmit:       (productId: string, quantity: number, note: string, expiryDate: string) => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
  open,
  products,
  loading,
  error,
  preselectedId,
  onClose,
  onSubmit,
}) => {
  const [productId,  setProductId]  = useState('');
  const [quantity,   setQuantity]   = useState('');
  const [note,       setNote]       = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    if (open) {
      setProductId(preselectedId ?? '');
      setQuantity('');
      setNote('');
      // Pre-fill expiry date if product already has one
      const existing = products.find((p) => p.id === preselectedId);
      setExpiryDate(existing?.expiryDate ?? '');
    }
  }, [open, preselectedId, products]);

  // Update expiry when product changes
  useEffect(() => {
    const existing = products.find((p) => p.id === productId);
    setExpiryDate(existing?.expiryDate ?? '');
  }, [productId, products]);

  const selected = products.find((p) => p.id === productId);

  const inputCls = `w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900
    placeholder-gray-400 text-sm focus:outline-none focus:bg-white
    focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-50`;

  return (
    <Modal open={open} onClose={onClose} title="Add Stock" persistent={loading}>
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}

        {/* Product select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={loading}
            className={inputCls}
          >
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — stock: {p.quantity}
              </option>
            ))}
          </select>
        </div>

        {/* Current stock indicator */}
        {selected && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
            <span className="text-xs text-gray-500">Current stock:</span>
            <StockLevel qty={selected.quantity} />
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity to Add</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={loading}
            placeholder="Enter quantity"
            className={inputCls}
          />
          {selected && quantity && !isNaN(parseInt(quantity)) && parseInt(quantity) > 0 && (
            <p className="text-xs text-green-600 mt-1">
              New stock will be: {selected.quantity + parseInt(quantity)}
            </p>
          )}
        </div>

        {/* Expiry date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Expiry Date
            <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            disabled={loading}
            min={new Date().toISOString().split('T')[0]}
            className={inputCls}
          />
          {selected?.isExpired && (
            <p className="text-xs text-red-500 mt-1">
              ⚠ This product's current expiry date has passed. Please update it.
            </p>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Note <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
            placeholder="e.g. Supplier delivery, batch #42"
            className={inputCls}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="lg" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            color="orange"
            size="lg"
            fullWidth
            loading={loading}
            onClick={() => onSubmit(productId, parseInt(quantity), note, expiryDate)}
          >
            Add Stock
          </Button>
        </div>
      </div>
    </Modal>
  );
};