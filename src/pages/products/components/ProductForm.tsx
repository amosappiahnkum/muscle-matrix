import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import Modal from '@/components/common/Modal';
import { ErrorBanner } from '@/components/common/Banner';
import Button from '@/components/common/Button';
import ExpiryDateInput, { inputCls } from './ExpiryDateInput';

// ─── Form state type (all strings — inputs are uncontrolled text) ─────────────
export interface ProductFormData {
  name:           string;
  quantity:       string;
  expiryDate:     string;   
  wholesalePrice: string;
  retailPrice:    string;
}

export const defaultForm: ProductFormData = {
  name:           '',
  quantity:       '',
  expiryDate:     '',
  wholesalePrice: '',
  retailPrice:    '',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProductFormProps {
  open:     boolean;
  editing:  Product | null;
  loading:  boolean;
  error:    string;
  onClose:  () => void;
  onSubmit: (data: ProductFormData) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ProductForm: React.FC<ProductFormProps> = ({
  open, editing, loading, error, onClose, onSubmit,
}) => {
  const [form, setForm] = useState<ProductFormData>(defaultForm);

  // Pre-fill when opening the edit modal.
  // Product.expiryDate is camelCase per the type definition.
  useEffect(() => {
    setForm(
      editing
        ? {
            name:           editing.name,
            quantity:       editing.quantity.toString(),
            // Normalise to YYYY-MM-DD so <input type="date"> renders correctly
            expiryDate:     editing.expiryDate
                              ? new Date(editing.expiryDate).toISOString().split('T')[0]
                              : '',
            wholesalePrice: editing.wholesalePrice.toString(),
            retailPrice:    editing.retailPrice.toString(),
          }
        : defaultForm
    );
  }, [editing, open]);

  const set =
    (key: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Product' : 'Add New Product'}
      persistent={loading}
    >
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}

        {/* Product name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Product Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            disabled={loading}
            placeholder="Enter product name"
            className={inputCls}
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Quantity Available
          </label>
          <input
            type="number"
            min="0"
            value={form.quantity}
            onChange={set('quantity')}
            disabled={loading}
            placeholder="Enter quantity"
            className={inputCls}
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Wholesale Price (GH₵)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.wholesalePrice}
              onChange={set('wholesalePrice')}
              disabled={loading}
              placeholder="0.00"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Retail Price (GH₵)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.retailPrice}
              onChange={set('retailPrice')}
              disabled={loading}
              placeholder="0.00"
              className={inputCls}
            />
          </div>
        </div>

        {/* Expiry date */}
        <ExpiryDateInput
          value={form.expiryDate}
          onChange={(val) => setForm((f) => ({ ...f, expiryDate: val }))}
          disabled={loading}
          isEditing={!!editing}
        />

        {/* Actions */}
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
            onClick={() => onSubmit(form)}
          >
            {editing ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductForm;