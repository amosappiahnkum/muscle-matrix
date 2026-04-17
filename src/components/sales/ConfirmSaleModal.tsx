import React from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../common/Modal.tsx';
import Button from '../common/Button.tsx';
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
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-orange-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Confirm Sale</h3>
      <p className="text-gray-400 text-sm">
        This action cannot be undone. Stock will be deducted immediately.
      </p>
    </div>

    <div className="bg-gray-700/50 rounded-xl p-4 mb-6 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Customer</span>
        <span className="text-white font-medium">{customerName}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Items</span>
        <span className="text-white font-medium">{cart.length}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Type</span>
        <span className={`font-semibold capitalize ${type === 'wholesale' ? 'text-blue-400' : 'text-green-400'}`}>
          {type}
        </span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-600 text-lg font-bold">
        <span className="text-white">Total</span>
        <span className="text-orange-400">GH₵{total.toFixed(2)}</span>
      </div>
    </div>

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
        variant="primary"
        color={type === 'wholesale' ? 'blue' : 'green'}
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
