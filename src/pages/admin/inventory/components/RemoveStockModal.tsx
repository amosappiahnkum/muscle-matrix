import React, { useEffect, useState } from 'react';
import { Product } from '@/types';
import Modal from '@/components/common/Modal.tsx';
import Button from '@/components/common/Button.tsx';
import { ErrorBanner } from '@/components/common/Banner.tsx';
import { StockLevel } from './StockLevel';

interface RemoveStockModalProps {
  open:           boolean;
  products:       Product[];
  loading:        boolean;
  error:          string;
  preselectedId?: string;
  onClose:        () => void;
  onSubmit:       (productId: string, quantity: number, note: string) => void;
}

export const RemoveStockModal: React.FC<RemoveStockModalProps> = ({
  open,
  products,
  loading,
  error,
  preselectedId,
  onClose,
  onSubmit,
}) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setProductId(preselectedId ?? '');
      setQuantity('');
      setNote('');
    }
  }, [open, preselectedId]);

  const selected = products.find((p) => p.id === productId);
  const parsedQuantity = Number.parseInt(quantity, 10);
  const nextStock = selected && !Number.isNaN(parsedQuantity)
    ? selected.quantity - parsedQuantity
    : selected?.quantity;

  const inputCls = `w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900
    placeholder-gray-400 text-sm focus:outline-none focus:bg-white
    focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all disabled:opacity-50`;

  return (
    <Modal open={open} onClose={onClose} title="Remove Stock" persistent={loading}>
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={loading}
            className={inputCls}
          >
            <option value="">Select a product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - stock: {p.quantity}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Current stock:</span>
              <StockLevel qty={selected.quantity} />
            </div>
            {selected.quantity > 0 && (
              <button
                type="button"
                onClick={() => setQuantity(String(selected.quantity))}
                disabled={loading}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity to Remove</label>
          <input
            type="number"
            min="1"
            max={selected?.quantity}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={loading || !selected || selected.quantity <= 0}
            placeholder="Enter quantity"
            className={inputCls}
          />
          {selected && selected.quantity <= 0 && (
            <p className="text-xs text-red-500 mt-1">This product has no stock to remove.</p>
          )}
          {selected && quantity && !Number.isNaN(parsedQuantity) && parsedQuantity > 0 && (
            <p className={`text-xs mt-1 ${nextStock !== undefined && nextStock < 0 ? 'text-red-500' : 'text-orange-600'}`}>
              New stock will be: {nextStock}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Note <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
            placeholder="e.g. Damaged stock, correction"
            className={inputCls}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="lg" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="lg"
            fullWidth
            loading={loading}
            onClick={() => onSubmit(productId, parsedQuantity, note)}
          >
            Remove Stock
          </Button>
        </div>
      </div>
    </Modal>
  );
};
