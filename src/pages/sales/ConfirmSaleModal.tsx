import React from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../../components/common/Modal.tsx';
import Button from '../../components/common/Button';
import { SaleItem } from '@/types';

interface ConfirmSaleModalProps {
  open: boolean;
  customerName: string;
  cart: SaleItem[];
  total: number;
  type: 'wholesale' | 'retail';
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmSaleModal: React.FC<ConfirmSaleModalProps> = ({
  open,
  customerName,
  cart,
  total,
  type,
  loading,
  onConfirm,
  onCancel,
}) => (
  <Modal open={open} persistent title="">

    {/* Icon + heading */}
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-orange-50 border border-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-orange-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">Confirm Sale</h3>
      <p className="text-gray-500 text-sm leading-relaxed">
        This action cannot be undone. Stock will be deducted immediately.
      </p>
    </div>

    {/* Summary card */}
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 space-y-3">

      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Customer</span>
        <span className="text-gray-900 font-medium">{customerName}</span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Sale type</span>
        <span className={`
          text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize
          ${type === 'wholesale'
            ? 'bg-blue-50 text-blue-600 border border-blue-200'
            : 'bg-green-50 text-green-600 border border-green-200'}
        `}>
          {type}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Items</span>
        <span className="text-gray-900 font-medium">
          {cart.length} {cart.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Divider + total */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <span className="text-gray-700 font-semibold text-sm">Total amount</span>
        <span className="text-orange-500 font-bold text-lg tracking-wide">
          GH₵{total.toFixed(2)}
        </span>
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-3">
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        color="orange"
        size="lg"
        fullWidth
        loading={loading}
        onClick={onConfirm}
      >
        Yes, Complete Sale
      </Button>
    </div>

  </Modal>
);

export default ConfirmSaleModal;