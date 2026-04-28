import React, { useState, useEffect } from 'react';
import { UserPlus, Edit3, Users, ShieldCheck, Dumbbell } from 'lucide-react';
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
  'w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors disabled:opacity-50 disabled:bg-gray-50';

const labelClass = 'block text-gray-600 text-sm font-medium mb-2';

// ── Aside panel content ──────────────────────────────────────────────────────
const FormAside = ({ editing }: { editing: User | null }) => (
  <div className="flex flex-col h-full gap-6">
    {/* Icon */}
    <div className="bg-white/20 rounded-2xl p-4 w-fit">
      {editing
        ? <Edit3 className="w-8 h-8 text-white" />
        : <UserPlus className="w-8 h-8 text-white" />
      }
    </div>

    {/* Title block */}
    <div>
      <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-1">
        Muscle Matrix
      </p>
      <h3 className="text-white text-2xl font-black leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
        {editing ? 'Edit\nEmployee' : 'Add New\nEmployee'}
      </h3>
      <p className="text-white/70 text-sm mt-2 leading-relaxed">
        {editing ? 'Update the employees credentials or role below.': 'Fill in the details to create a new staff account.'}
      </p>
    </div>

    {/* Role legend */}
    <div className="mt-auto space-y-3">
      <p className="text-white/50 text-xs font-semibold tracking-wider uppercase">Roles</p>
      <div className="flex items-center gap-2 text-white/80 text-sm">
        <ShieldCheck className="w-4 h-4 text-white/60 flex-shrink-0" />
        <span><span className="font-semibold text-white">Wholesale</span> — bulk pricing</span>
      </div>
      <div className="flex items-center gap-2 text-white/80 text-sm">
        <Dumbbell className="w-4 h-4 text-white/60 flex-shrink-0" />
        <span><span className="font-semibold text-white">Retail</span> — standard pricing</span>
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center gap-2 text-white/40 text-xs mt-2">
      <Users className="w-3.5 h-3.5" />
      Staff portal
    </div>
  </div>
);

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
      subtitle="Fill in the fields below and save"
      persistent={loading}
      aside={<FormAside editing={editing} />}
    >
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}

        <div>
          <label className={labelClass}>Username</label>
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
          <label className={labelClass}>
            Password{' '}
            {editing && (
              <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
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
          <label className={labelClass}>Role</label>
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