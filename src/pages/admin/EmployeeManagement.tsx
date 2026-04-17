import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';
import { User, UserRole } from '@/types';
import { getUsers, saveUser, deleteUser } from '@/api/api.ts';
import Modal from '../../components/common/Modal.tsx';
import { ErrorBanner, SuccessBanner } from '../../components/common/Banner.tsx';
import Button from '../../components/common/Button.tsx';
import DataTable, { Column } from '../../components/common/DataTable.tsx';

// ─── Employee Form Modal ──────────────────────────────────────────────────────

interface FormData {
  username: string;
  password: string;
  role: UserRole;
}

const defaultForm: FormData = { username: '', password: '', role: 'wholesale' };

interface EmployeeFormProps {
  open: boolean;
  editing: User | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
                                                     open,
                                                     editing,
                                                     loading,
                                                     error,
                                                     onClose,
                                                     onSubmit,
                                                   }) => {
  const [form, setForm] = useState<FormData>(defaultForm);

  // Sync form when editing changes
  useEffect(() => {
    if (editing) {
      setForm({ username: editing.username, password: '', role: editing.role });
    } else {
      setForm(defaultForm);
    }
  }, [editing, open]);

  const set = (key: keyof FormData) => (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const inputClass =
      'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50';

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
              Password {editing && <span className="text-gray-500 font-normal">(leave blank to keep current)</span>}
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

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteConfirmProps {
  open: boolean;
  username: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
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

// ─── Main Component ───────────────────────────────────────────────────────────

const EmployeeManagement: React.FC = () => {
  const [employees,    setEmployees]    = useState<User[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [formOpen,     setFormOpen]     = useState(false);
  const [formLoading,  setFormLoading]  = useState(false);
  const [formError,    setFormError]    = useState('');
  const [editingUser,  setEditingUser]  = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [success,      setSuccess]      = useState('');

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getUsers();
      setEmployees(all.filter((u) => u.role !== 'admin'));
    } catch {
      // leave empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (form: FormData) => {
    setFormError('');

    if (!form.username.trim()) {
      setFormError('Username is required.');
      return;
    }
    if (!editingUser && !form.password) {
      setFormError('Password is required for new employees.');
      return;
    }

    setFormLoading(true);
    try {
      const payload: Record<string, unknown> = {
        username: form.username.trim(),
        role:     form.role,
      };
      // Only send password if provided (for edits, blank = keep current)
      if (form.password) payload.password = form.password;

      if (editingUser) {
        await saveUser({ id: editingUser.id, ...payload });
        flash('Employee updated successfully.');
      } else {
        await saveUser(payload as Parameters<typeof saveUser>[0]);
        flash('Employee added successfully.');
      }

      setFormOpen(false);
      setEditingUser(null);
      await load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save employee.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget.id);
      flash('Employee deleted successfully.');
      setDeleteTarget(null);
      await load();
    } catch (err: unknown) {
      setSuccess('');
      flash(err instanceof Error ? err.message : 'Failed to delete employee.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormError('');
    setFormOpen(true);
  };

  const openAdd = () => {
    setEditingUser(null);
    setFormError('');
    setFormOpen(true);
  };

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns: Column<User>[] = [
    {
      key: 'username',
      header: 'Username',
      render: (u) => <span className="text-white font-medium">{u.username}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
          <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  u.role === 'wholesale'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-green-500/20 text-green-400'
              }`}
          >
          {u.role}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (u) => (
          <span className="text-gray-400 text-sm">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
          <div className="flex justify-end gap-2">
            <button
                onClick={() => openEdit(u)}
                className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
                onClick={() => setDeleteTarget(u)}
                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
      ),
    },
  ];

  return (
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Employee Management</h3>
          <Button
              variant="primary"
              color="orange"
              icon={<UserPlus className="w-5 h-5" />}
              onClick={openAdd}
          >
            Add Employee
          </Button>
        </div>

        {/* Success banner */}
        {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}

        {/* Table */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <DataTable
              columns={columns}
              data={employees}
              keyExtractor={(u) => u.id}
              loading={loading}
              emptyMessage='No employees found. Click "Add Employee" to create one.'
          />
        </div>

        {/* Add / Edit modal */}
        <EmployeeForm
            open={formOpen}
            editing={editingUser}
            loading={formLoading}
            error={formError}
            onClose={() => { setFormOpen(false); setEditingUser(null); }}
            onSubmit={handleSubmit}
        />

        {/* Delete confirm modal */}
        <DeleteConfirm
            open={!!deleteTarget}
            username={deleteTarget?.username ?? ''}
            loading={deleteLoading}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
        />
      </div>
  );
};

export default EmployeeManagement;