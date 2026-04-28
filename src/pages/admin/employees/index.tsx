import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { User } from '@/types';
import { getUsers, saveUser, deleteUser } from '@/api/api';
import { SuccessBanner } from '@/components/common/Banner';
import Button from '@/components/common/Button';
import PageLayout from '@/components/admin-layouts/PageLayouts';

import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeForm, FormData } from './components/EmployeeForm';
import { DeleteConfirm } from './components/DeleteConfirm';

const EmployeeManagement: React.FC = () => {
  const [employees,     setEmployees]     = useState<User[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [formOpen,      setFormOpen]      = useState(false);
  const [formLoading,   setFormLoading]   = useState(false);
  const [formError,     setFormError]     = useState('');
  const [editingUser,   setEditingUser]   = useState<User | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [success,       setSuccess]       = useState('');

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

  // ── Form submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (form: FormData) => {
    setFormError('');

    if (!form.username.trim()) { setFormError('Username is required.'); return; }
    if (!editingUser && !form.password) { setFormError('Password is required for new employees.'); return; }

    setFormLoading(true);
    try {
      const payload: Record<string, unknown> = {
        username: form.username.trim(),
        role:     form.role,
      };
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

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget.id);
      flash('Employee deleted successfully.');
      setDeleteTarget(null);
      await load();
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Failed to delete employee.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (user: User) => { setEditingUser(user); setFormError(''); setFormOpen(true); };
  const openAdd  = ()           => { setEditingUser(null); setFormError(''); setFormOpen(true); };

  return (
    <PageLayout
      title="Employee Management"
      subtitle="Manage your staff accounts and roles"
      icon={<Users size={16} className="text-orange-500" />}
      actions={
        <Button
          variant="primary"
          color="orange"
          icon={<UserPlus className="w-5 h-5" />}
          onClick={openAdd}
        >
          Add Employee
        </Button>
      }
    >
      {success && (
        <SuccessBanner message={success} onDismiss={() => setSuccess('')} />
      )}

      <EmployeeTable
        employees={employees}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <EmployeeForm
        open={formOpen}
        editing={editingUser}
        loading={formLoading}
        error={formError}
        onClose={() => { setFormOpen(false); setEditingUser(null); }}
        onSubmit={handleSubmit}
      />

      <DeleteConfirm
        open={!!deleteTarget}
        username={deleteTarget?.username ?? ''}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageLayout>
  );
};

export default EmployeeManagement;