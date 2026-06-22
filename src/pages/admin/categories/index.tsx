import React, { useEffect, useState, useCallback } from 'react';
import { Input } from 'antd';
import { Plus, Tag } from 'lucide-react';
import Button from '@/components/common/Button';
import { ErrorBanner, SuccessBanner } from '@/components/common/Banner';
import {
  getCategories, saveCategory, deleteCategory,
  Category, CategoryPayload,
} from '@/api/api';
import CategoriesTable from './CategoriesTable';
import CategoryForm from './CategoryForm';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered,   setFiltered]   = useState<Category[]>([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState<number | null>(null);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Category | null>(null);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [formError,  setFormError]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q
      ? categories.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
        )
      : categories
    );
  }, [search, categories]);

  const openAdd    = () => { setEditing(null); setFormError(''); setModalOpen(true); };
  const openEdit   = (c: Category) => { setEditing(c); setFormError(''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setFormError(''); };

  const handleSave = async (payload: CategoryPayload) => {
    setSaving(true);
    setFormError('');
    try {
      await saveCategory({ ...payload, id: editing?.id });
      setSuccess(editing ? 'Category updated.' : 'Category added.');
      closeModal();
      load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await deleteCategory(id);
      setSuccess('Category deleted.');
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete category.');
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
            background: '#fdf4ff', border: '1px solid #e9d5ff',
            borderRadius: 12, padding: 10, display: 'flex',
          }}>
            <Tag size={20} style={{ color: '#a855f7' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Categories</p>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} total
            </p>
          </div>
        </div>
        <Button variant="primary"  size="md" icon={<Plus size={15} />} onClick={openAdd}>
          Add Category
        </Button>
      </div>

      {error   && <ErrorBanner   message={error}   onDismiss={() => setError('')}   />}
      {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}

      {/* Search */}
      <Input.Search
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search categories…"
        allowClear
        style={{ maxWidth: 360 }}
      />

      {/* Table */}
      <CategoriesTable
        data={filtered}
        loading={loading}
        deleting={deleting}
        search={search}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Form modal */}
      <CategoryForm
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

export default CategoriesPage;