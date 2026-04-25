import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types';
import Modal from '@/components/common/Modal';
import { ErrorBanner } from '@/components/common/Banner';
import Button from '@/components/common/Button';
import { User } from '@/types';

export interface FormData {
  username: string;
  password: string;
  role: UserRole;
}

export const defaultForm: FormData = { username: '', password: '', role: 'wholesale' };

interface EmployeeFormProps {
  open:     boolean;
  editing:  User | null;
  loading:  boolean;
  error:    string;
  onClose:  () => void;
  onSubmit: (data: FormData) => void;
}

const inputClass =
  'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50';

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  open, editing, loading, error, onClose, onSubmit,
}) => {
  const [form, setForm] = useState<FormData>(defaultForm);

  useEffect(() => {
    setForm(editing
      ? { username: editing.username, password: '', role: editing.role }
      : defaultForm
    );
  }, [editing, open]);

  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Employee' : 'Add New Employee'}
      persistent={loading}
    >
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={set('username')}
            disabled={loading}
            placeholder="Enter username"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Password{' '}
            {editing && (
              <span className="text-gray-500 font-normal">(leave blank to keep current)</span>
            )}
          </label>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            disabled={loading}
            placeholder={editing ? 'Enter new password' : 'Enter password'}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
          <select
            value={form.role}
            onChange={set('role')}
            disabled={loading}
            className={inputClass}
          >
            <option value="wholesale">Wholesale</option>
            <option value="retail">Retail</option>
          </select>
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
            onClick={() => onSubmit(form)}
          >
            {editing ? 'Update Employee' : 'Add Employee'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};