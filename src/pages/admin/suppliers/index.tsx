import React, { useEffect, useState, useCallback } from 'react';
import { Input } from 'antd';
import { Plus, Truck } from 'lucide-react';
import Button from '@/components/common/Button';
import { ErrorBanner, SuccessBanner } from '@/components/common/Banner';
import {
  getSuppliers, saveSupplier, deleteSupplier,
  Supplier, SupplierPayload,
} from '@/api/api';
import SuppliersTable from './SuppliersTable';
import SupplierForm from './SupplierForm';

const SuppliersPage: React.FC = () => {
  const [suppliers,  setSuppliers]  = useState<Supplier[]>([]);
  const [filtered,   setFiltered]   = useState<Supplier[]>([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState<number | null>(null);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Supplier | null>(null);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [formError,  setFormError]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load suppliers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q
      ? suppliers.filter(s =>
          s.name.toLowerCase().includes(q)           ||
          s.contactPerson?.toLowerCase().includes(q) ||
          s.phone?.toLowerCase().includes(q)         ||
          s.email?.toLowerCase().includes(q)
        )
      : suppliers
    );
  }, [search, suppliers]);

  const openAdd    = () => { setEditing(null); setFormError(''); setModalOpen(true); };
  const openEdit   = (s: Supplier) => { setEditing(s); setFormError(''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setFormError(''); };

  const handleSave = async (payload: SupplierPayload) => {
    setSaving(true);
    setFormError('');
    try {
      await saveSupplier({ ...payload, id: editing?.id });
      setSuccess(editing ? 'Supplier updated.' : 'Supplier added.');
      closeModal();
      load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save supplier.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await deleteSupplier(id);
      setSuccess('Supplier deleted.');
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete supplier.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 12, padding: 10, display: 'flex',
          }}>
            <Truck size={20} style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Suppliers</p>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              {suppliers.length} supplier{suppliers.length === 1 ? '' : 's'} total
            </p>
          </div>
        </div>
        <Button variant="primary" color="blue" size="md" icon={<Plus size={15} />} onClick={openAdd}>
          Add Supplier
        </Button>
      </div>

      {error   && <ErrorBanner   message={error}   onDismiss={() => setError('')}   />}
      {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}

      {/* Search */}
      <Input.Search
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, contact, phone or email…"
        allowClear
        style={{ maxWidth: 420 }}
      />

      {/* Table */}
      <SuppliersTable
        data={filtered}
        loading={loading}
        deleting={deleting}
        search={search}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Form modal */}
      <SupplierForm
        open={modalOpen}
        isEditing={!!editing}
        initial={editing ?? {}}
        saving={saving}
        error={formError}
        onSave={handleSave}
        onCancel={closeModal}
      />
    </div>
  );
};

export default SuppliersPage;