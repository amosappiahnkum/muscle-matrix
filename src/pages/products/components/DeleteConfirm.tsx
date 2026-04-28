import React from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

interface DeleteConfirmProps {
  open:        boolean;
  productName: string;
  loading:     boolean;
  onConfirm:   () => void;
  onCancel:    () => void;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  open, productName, loading, onConfirm, onCancel,
}) => (
  <Modal open={open} title="Delete Product" persistent={loading}>
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        Are you sure you want to delete{' '}
        <span className="text-gray-900 font-semibold">{productName}</span>?
        This cannot be undone.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" fullWidth onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" size="lg" fullWidth loading={loading} onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </div>
  </Modal>
);

export default DeleteConfirm;