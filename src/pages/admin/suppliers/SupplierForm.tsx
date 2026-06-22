import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { Truck } from 'lucide-react';
import Button from '@/components/common/Button';
import { ErrorBanner } from '@/components/common/Banner';
import Modal from '@/components/common/Modal';
import { SupplierPayload } from '@/api/api';

const Label: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
    {children}
    {hint && <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 4, fontSize: 12 }}>{hint}</span>}
  </label>
);

interface SupplierFormProps {
  initial:   Partial<SupplierPayload>;
  saving:    boolean;
  error:     string;
  open:      boolean;
  isEditing: boolean;
  onSave:    (payload: SupplierPayload) => void;
  onCancel:  () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  initial, saving, error, open, isEditing, onSave, onCancel,
}) => {
  const [form, setForm] = useState({
    name:          initial.name          ?? '',
    contactPerson: initial.contactPerson ?? '',
    phone:         initial.phone         ?? '',
    email:         initial.email         ?? '',
    address:       initial.address       ?? '',
    note:          initial.note          ?? '',
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setForm({
      name:          initial.name          ?? '',
      contactPerson: initial.contactPerson ?? '',
      phone:         initial.phone         ?? '',
      email:         initial.email         ?? '',
      address:       initial.address       ?? '',
      note:          initial.note          ?? '',
    });
    setValidationError('');
  }, [initial, open]);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim()) {
      setValidationError('Supplier name is required.');
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setValidationError('Enter a valid email address.');
      return;
    }
    setValidationError('');
    onSave(form);
  };

  const displayError = validationError || error;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={isEditing ? 'Edit Supplier' : 'Add Supplier'}
      icon={<Truck size={18} style={{ color: '#3b82f6' }} />}
      maxWidth="md"
      persistent={saving}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {displayError && <ErrorBanner message={displayError} />}

        <div>
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Accra Supplements Ltd"
            disabled={saving}
            size="large"
            status={validationError && !form.name.trim() ? 'error' : undefined}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Label hint="(optional)">Contact Person</Label>
            <Input
              value={form.contactPerson}
              onChange={set('contactPerson')}
              placeholder="Full name"
              disabled={saving}
              size="large"
            />
          </div>
          <div>
            <Label hint="(optional)">Phone</Label>
            <Input
              value={form.phone}
              onChange={set('phone')}
              placeholder="+233 XX XXX XXXX"
              disabled={saving}
              size="large"
            />
          </div>
        </div>

        <div>
          <Label hint="(optional)">Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="supplier@example.com"
            disabled={saving}
            size="large"
            status={validationError && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'error' : undefined}
          />
        </div>

        <div>
          <Label hint="(optional)">Address</Label>
          <Input
            value={form.address}
            onChange={set('address')}
            placeholder="Street, city"
            disabled={saving}
            size="large"
          />
        </div>

        <div>
          <Label hint="(optional)">Note</Label>
          <Input.TextArea
            value={form.note}
            onChange={set('note')}
            placeholder="Any additional info"
            disabled={saving}
            autoSize={{ minRows: 3 }}
            style={{ resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <Button variant="secondary" size="md" fullWidth onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" color="blue" size="md" fullWidth loading={saving} onClick={handleSave}>
            Save Supplier
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SupplierForm;