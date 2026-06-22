import React, { useState } from 'react';
import { Input } from 'antd';
import { Tag } from 'lucide-react';
import Button from '@/components/common/Button';
import { ErrorBanner } from '@/components/common/Banner';
import Modal from '@/components/common/Modal';
import { CategoryPayload } from '@/api/api';

const Label: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
    {children}
    {hint && <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 4, fontSize: 12 }}>{hint}</span>}
  </label>
);

interface CategoryFormProps {
  initial:   Partial<CategoryPayload>;
  saving:    boolean;
  error:     string;
  open:      boolean;
  isEditing: boolean;
  onSave:    (payload: CategoryPayload) => void;
  onCancel:  () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initial, saving, error, open, isEditing, onSave, onCancel,
}) => {
  const [form, setForm] = useState({
    name:        initial.name        ?? '',
    description: initial.description ?? '',
  });
  const [validationError, setValidationError] = useState('');

  // Sync when initial changes (switching between add / edit)
  React.useEffect(() => {
    setForm({ name: initial.name ?? '', description: initial.description ?? '' });
    setValidationError('');
  }, [initial, open]);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim()) { setValidationError('Category name is required.'); return; }
    setValidationError('');
    onSave(form);
  };

  const displayError = validationError || error;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={isEditing ? 'Edit Category' : 'Add Category'}
      icon={<Tag size={18} style={{ color: '#a855f7' }} />}
      maxWidth="sm"
      persistent={saving}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {displayError && <ErrorBanner message={displayError} />}

        <div>
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Utilities, Transport, Inventory"
            disabled={saving}
            size="large"
            status={validationError && !form.name.trim() ? 'error' : undefined}
          />
        </div>

        <div>
          <Label hint="(optional)">Description</Label>
          <Input.TextArea
            value={form.description ?? ''}
            onChange={set('description')}
            placeholder="What kind of expenses fall under this category?"
            disabled={saving}
            autoSize={{ minRows: 3 }}
            style={{ resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <Button variant="secondary" size="md" fullWidth onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary"  size="md" fullWidth loading={saving} onClick={handleSave}>
            Save Category
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryForm;