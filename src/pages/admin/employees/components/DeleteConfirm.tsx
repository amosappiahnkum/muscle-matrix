import React from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

interface DeleteConfirmProps {
  open:      boolean;
  username:  string;
  loading:   boolean;
  onConfirm: () => void;
  onCancel:  () => void;
}

export const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  open, username, loading, onConfirm, onCancel,
}) => (
  <Modal open={open} title="Delete Employee" persistent={loading}>
    <div className="space-y-4">
      <p className="text-gray-300 text-sm">
        Are you sure you want to delete{' '}
        <span className="text-white font-semibold">{username}</span>?
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