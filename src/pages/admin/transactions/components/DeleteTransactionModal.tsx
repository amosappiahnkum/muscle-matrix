import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Transaction } from '@/types';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

interface DeleteTransactionModalProps {
  transaction: Transaction | null;
  loading:     boolean;
  onConfirm:   () => void;
  onCancel:    () => void;
}

const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = ({
  transaction,
  loading,
  onConfirm,
  onCancel,
}) => (
  <Modal
    open={!!transaction}
    onClose={onCancel}
    title="Delete Sale"
    icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
    persistent={loading}
  >
    {transaction && (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-gray-700 text-sm">
            Delete sale{' '}
            <span className="font-semibold text-gray-900">{transaction.receiptNumber}</span>?
          </p>
          <p className="text-gray-500 text-sm">
            This will remove the sale record and restore the sold stock back to inventory.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Customer</span>
            <span className="font-medium text-gray-900">{transaction.customerName}</span>
          </div>
          <div className="flex justify-between gap-4 mt-1">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold text-orange-500">
              GH₵{transaction.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="lg" fullWidth onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="lg" fullWidth loading={loading} onClick={onConfirm}>
            Delete Sale
          </Button>
        </div>
      </div>
    )}
  </Modal>
);

export default DeleteTransactionModal;
