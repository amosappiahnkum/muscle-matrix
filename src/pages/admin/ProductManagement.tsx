import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import { Product } from '../../types';
import { getProducts, saveProduct, deleteProduct } from '../../api/api.ts';
import Modal from '../../components/common/Modal.tsx';
import { ErrorBanner, SuccessBanner } from '../../components/common/Banner.tsx';
import Button from '../../components/common/Button.tsx';
import DataTable, { Column } from '../../components/common/DataTable.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  name:           string;
  quantity:       string;
    expiry_date: string;
  wholesalePrice: string;
  retailPrice:    string;
}
const defaultForm: FormData = { name: '', quantity: '',expiry_date:'', wholesalePrice: '', retailPrice: '' };

// ─── Stock badge ──────────────────────────────────────────────────────────────
const StockBadge: React.FC<{ qty: number }> = ({ qty }) => {
  const style =
    qty <= 10  ? 'bg-red-50 text-red-600 border border-red-200' :
    qty <= 50  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                 'bg-green-50 text-green-700 border border-green-200';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {qty}
    </span>
  );
};

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls = `w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
  text-gray-900 placeholder-gray-400 text-sm
  focus:outline-none focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100
  transition-all disabled:opacity-50`;

// ─── Product Form Modal ───────────────────────────────────────────────────────
interface ProductFormProps {
  open:     boolean;
  editing:  Product | null;
  loading:  boolean;
  error:    string;
  onClose:  () => void;
  onSubmit: (data: FormData) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  open, editing, loading, error, onClose, onSubmit,
}) => {
  const [form, setForm] = useState<FormData>(defaultForm);

  useEffect(() => {
    setForm(editing ? {
      name:           editing.name,
      quantity:       editing.quantity.toString(),
expiry_date: editing.expiry_date
      ? new Date(editing.expiry_date).toISOString().split('T')[0]
      : '',
            wholesalePrice: editing.wholesalePrice.toString(),
      retailPrice:    editing.retailPrice.toString(),
    } : defaultForm);
  }, [editing, open]);

  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
   <Modal open={open} onClose={onClose} title={editing ? 'Edit Product' : 'Add New Product'} persistent={loading}>
  <div className="space-y-4">
    {error && <ErrorBanner message={error} />}

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name</label>
      <input type="text" value={form.name} onChange={set('name')} disabled={loading} placeholder="Enter product name" className={inputCls} />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity Available</label>
      <input type="number" min="0" value={form.quantity} onChange={set('quantity')} disabled={loading} placeholder="Enter quantity" className={inputCls} />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Wholesale Price (GH₵)</label>
        <input type="number" min="0" step="0.01" value={form.wholesalePrice} onChange={set('wholesalePrice')} disabled={loading} placeholder="0.00" className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Retail Price (GH₵)</label>
        <input type="number" min="0" step="0.01" value={form.retailPrice} onChange={set('retailPrice')} disabled={loading} placeholder="0.00" className={inputCls} />
      </div>
    </div>

    {/* Expiry Date */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        Expiry Date
        <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
      </label>
      <input
        type="date"
        value ={form.expiry_date}
        onChange={set('expiry_date')}
        disabled={loading}
min={!editing ? new Date().toISOString().split('T')[0] : undefined}
        className={`${inputCls} ${
          form.expiry_date && new Date(form.expiry_date) < new Date()
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : ''
        }`}
      />
      {form.expiry_date && (() => {
        const days = Math.ceil(
          (new Date(form.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (days < 0)  return <p className="text-xs text-red-500 mt-1">⚠ This product has already expired</p>;
        if (days <= 30) return <p className="text-xs text-yellow-600 mt-1">⚠ Expires in {days} day{days !== 1 ? 's' : ''}</p>;
        return <p className="text-xs text-green-600 mt-1">✓ Expires in {days} days</p>;
      })()}
    </div>

    <div className="flex gap-3 pt-2">
      <Button variant="secondary" size="lg" fullWidth onClick={onClose} disabled={loading}>Cancel</Button>
      <Button variant="primary" color="orange" size="lg" fullWidth loading={loading} onClick={() => onSubmit(form)}>
        {editing ? 'Update Product' : 'Add Product'}
      </Button>
    </div>
  </div>
</Modal>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
interface DeleteConfirmProps {
  open:        boolean;
  productName: string;
  loading:     boolean;
  onConfirm:   () => void;
  onCancel:    () => void;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ open, productName, loading, onConfirm, onCancel }) => (
  <Modal open={open} title="Delete Product" persistent={loading}>
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        Are you sure you want to delete{' '}
        <span className="text-gray-900 font-semibold">{productName}</span>?
        This cannot be undone.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" fullWidth onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="danger"    size="lg" fullWidth loading={loading}  onClick={onConfirm}>Delete</Button>
      </div>
    </div>
  </Modal>
);

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

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts(await getProducts()); }
    catch { /* leave empty */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (form: FormData) => {
  setFormError('');

  if (!form.name.trim() || !form.expiry_date || !form.quantity || !form.wholesalePrice || !form.retailPrice) {
    setFormError('Please fill in all fields.');
    return;
  }

  const quantity       = parseInt(form.quantity);
  const wholesalePrice = parseFloat(form.wholesalePrice);
  const retailPrice    = parseFloat(form.retailPrice);
  const expiryDate     = new Date(form.expiry_date);

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

  if (isNaN(expiryDate.getTime())) {
    setFormError('Invalid expiry date.');
    return;
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  if (expiryDate < today) {
    setFormError('Expiry date cannot be in the past.');
    return;
  }

  const formattedExpiry = expiryDate.toISOString().split('T')[0];

  setFormLoading(true);

  try {
    await saveProduct({
      ...(editingProduct ? { id: editingProduct.id } : {}),
      name: form.name.trim(),
      expiry_date: formattedExpiry, 
      quantity,
      wholesalePrice,
      retailPrice
    });

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try { await deleteProduct(deleteTarget.id); flash('Product deleted successfully.'); setDeleteTarget(null); await load(); }
    catch (err: unknown) { flash(err instanceof Error ? err.message : 'Failed to delete product.'); }
    finally { setDeleteLoading(false); }
  };

  const openEdit = (p: Product) => { setEditingProduct(p); setFormError(''); setFormOpen(true); };
  const openAdd  = ()           => { setEditingProduct(null); setFormError(''); setFormOpen(true); };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns: Column<Product>[] = [
    {
      key: 'name', header: 'Product Name',
      render: (p) => <span className="text-gray-900 font-medium">{p.name}</span>,
    },
    {
      key: 'expiry_date', header: 'Expiry Date',
      render: (p) => <span className="text-gray-900 font-medium">{p.expiry_date}</span>,
    },
    {
      key: 'quantity', header: 'Quantity', align: 'center',
      render: (p) => <StockBadge qty={p.quantity} />,
    },
    {
      key: 'wholesalePrice', header: 'Wholesale (GH₵)', align: 'right',
      render: (p) => <span className="text-blue-600 font-medium">{p.wholesalePrice.toFixed(2)}</span>,
    },
    {
      key: 'retailPrice', header: 'Retail (GH₵)', align: 'right',
      render: (p) => <span className="text-green-600 font-medium">{p.retailPrice.toFixed(2)}</span>,
    },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => openEdit(p)} title="Edit"
            className="p-1.5 bg-blue-50 text-blue-500 border border-blue-100 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => setDeleteTarget(p)} title="Delete"
            className="p-1.5 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-xl">
            <Package size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
            <p className="text-gray-400 text-sm">{products.length} products total</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                text-gray-900 placeholder-gray-400 text-sm
                focus:outline-none focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100
                transition-all"
            />
          </div>
          <Button variant="primary" color="orange" icon={<Plus size={16} />} onClick={openAdd}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Success banner */}
      {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {!loading && filtered.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">
              {searchQuery ? `No products matching "${searchQuery}"` : 'No products yet'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {!searchQuery && 'Click "Add Product" to create your first product.'}
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={filtered} keyExtractor={(p) => p.id} loading={loading} />
        )}
      </div>

      <ProductForm
        open={formOpen} editing={editingProduct} loading={formLoading} error={formError}
        onClose={() => { setFormOpen(false); setEditingProduct(null); }}
        onSubmit={handleSubmit}
      />
      <DeleteConfirm
        open={!!deleteTarget} productName={deleteTarget?.name ?? ''} loading={deleteLoading}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProductManagement;