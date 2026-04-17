// src/components/admin-layouts/ProductManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import { Product } from '../../types';
import { getProducts, saveProduct, deleteProduct } from '../../api/api.ts';
import Modal from '../../components/common/Modal.tsx';
import { ErrorBanner, SuccessBanner } from '../../components/common/Banner.tsx';
import Button from '../../components/common/Button.tsx';
import DataTable, { Column } from '../../components/common/DataTable.tsx';

// ─── Product Form Modal ───────────────────────────────────────────────────────

interface FormData {
  name: string;
  quantity: string;
  wholesalePrice: string;
  retailPrice: string;
}

const defaultForm: FormData = {
  name: '', quantity: '', wholesalePrice: '', retailPrice: '',
};

interface ProductFormProps {
  open: boolean;
  editing: Product | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
                                                   open, editing, loading, error, onClose, onSubmit,
                                                 }) => {
  const [form, setForm] = useState<FormData>(defaultForm);

  useEffect(() => {
    if (editing) {
      setForm({
        name:           editing.name,
        quantity:       editing.quantity.toString(),
        wholesalePrice: editing.wholesalePrice.toString(),
        retailPrice:    editing.retailPrice.toString(),
      });
    } else {
      setForm(defaultForm);
    }
  }, [editing, open]);

  const set = (key: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
          setForm((f) => ({ ...f, [key]: e.target.value }));

  const inputClass =
      'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50';

  return (
      <Modal
          open={open}
          onClose={onClose}
          title={editing ? 'Edit Product' : 'Add New Product'}
          persistent={loading}
      >
        <div className="space-y-4">
          {error && <ErrorBanner message={error} />}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Product Name</label>
            <input
                type="text"
                value={form.name}
                onChange={set('name')}
                disabled={loading}
                placeholder="Enter product name"
                className={inputClass}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Quantity Available</label>
            <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={set('quantity')}
                disabled={loading}
                placeholder="Enter quantity"
                className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Wholesale Price (GH₵)</label>
              <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.wholesalePrice}
                  onChange={set('wholesalePrice')}
                  disabled={loading}
                  placeholder="0.00"
                  className={inputClass}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Retail Price (GH₵)</label>
              <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.retailPrice}
                  onChange={set('retailPrice')}
                  disabled={loading}
                  placeholder="0.00"
                  className={inputClass}
              />
            </div>
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
              {editing ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </div>
      </Modal>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteConfirmProps {
  open: boolean;
  productName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
                                                       open, productName, loading, onConfirm, onCancel,
                                                     }) => (
    <Modal open={open} title="Delete Product" persistent={loading}>
      <div className="space-y-4">
        <p className="text-gray-300 text-sm">
          Are you sure you want to delete{' '}
          <span className="text-white font-semibold">{productName}</span>?
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

// ─── Stock badge ──────────────────────────────────────────────────────────────

const StockBadge: React.FC<{ qty: number }> = ({ qty }) => {
  const style =
      qty <= 10  ? 'bg-red-500/20 text-red-400' :
          qty <= 50  ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400';
  return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {qty}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductManagement: React.FC = () => {
  const [products,       setProducts]       = useState<Product[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [formOpen,       setFormOpen]       = useState(false);
  const [formLoading,    setFormLoading]    = useState(false);
  const [formError,      setFormError]      = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<Product | null>(null);
  const [deleteLoading,  setDeleteLoading]  = useState(false);
  const [success,        setSuccess]        = useState('');

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
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

    if (!form.name.trim() || !form.quantity || !form.wholesalePrice || !form.retailPrice) {
      setFormError('Please fill in all fields.');
      return;
    }

    const quantity       = parseInt(form.quantity);
    const wholesalePrice = parseFloat(form.wholesalePrice);
    const retailPrice    = parseFloat(form.retailPrice);

    if (isNaN(quantity) || quantity < 0) {
      setFormError('Quantity must be a non-negative number.');
      return;
    }
    if (isNaN(wholesalePrice) || wholesalePrice < 0) {
      setFormError('Wholesale price must be a non-negative number.');
      return;
    }
    if (isNaN(retailPrice) || retailPrice < 0) {
      setFormError('Retail price must be a non-negative number.');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        ...(editingProduct ? { id: editingProduct.id } : {}),
        name: form.name.trim(),
        quantity,
        wholesalePrice,
        retailPrice,
      };
      await saveProduct(payload);
      flash(editingProduct ? 'Product updated successfully.' : 'Product added successfully.');
      setFormOpen(false);
      setEditingProduct(null);
      await load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(deleteTarget.id);
      flash('Product deleted successfully.');
      setDeleteTarget(null);
      await load();
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormError('');
    setFormOpen(true);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setFormError('');
    setFormOpen(true);
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product Name',
      render: (p) => <span className="text-white font-medium">{p.name}</span>,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      align: 'center',
      render: (p) => <StockBadge qty={p.quantity} />,
    },
    {
      key: 'wholesalePrice',
      header: 'Wholesale (GH₵)',
      align: 'right',
      render: (p) => <span className="text-blue-400">{p.wholesalePrice.toFixed(2)}</span>,
    },
    {
      key: 'retailPrice',
      header: 'Retail (GH₵)',
      align: 'right',
      render: (p) => <span className="text-green-400">{p.retailPrice.toFixed(2)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
          <div className="flex justify-end gap-2">
            <button
                onClick={() => openEdit(p)}
                className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
                onClick={() => setDeleteTarget(p)}
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold text-white">Product Management</h3>
          <div className="flex gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <Button
                variant="primary"
                color="orange"
                icon={<Plus className="w-5 h-5" />}
                onClick={openAdd}
            >
              Add Product
            </Button>
          </div>
        </div>

        {/* Success banner */}
        {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}

        {/* Table */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          {!loading && filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400 text-sm">
                  {searchQuery
                      ? `No products matching "${searchQuery}".`
                      : 'No products yet. Click "Add Product" to create one.'}
                </p>
              </div>
          ) : (
              <DataTable
                  columns={columns}
                  data={filtered}
                  keyExtractor={(p) => p.id}
                  loading={loading}
              />
          )}
        </div>

        {/* Add / Edit modal */}
        <ProductForm
            open={formOpen}
            editing={editingProduct}
            loading={formLoading}
            error={formError}
            onClose={() => { setFormOpen(false); setEditingProduct(null); }}
            onSubmit={handleSubmit}
        />

        {/* Delete confirm modal */}
        <DeleteConfirm
            open={!!deleteTarget}
            productName={deleteTarget?.name ?? ''}
            loading={deleteLoading}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
        />
      </div>
  );
};

export default ProductManagement;