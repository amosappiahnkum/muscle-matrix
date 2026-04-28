import React, { useState } from 'react';
import { Plus, Search, Package, Edit2, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { useProducts } from './components/useProducts';
import { SuccessBanner } from '../../components/common/Banner';
import Button from '../../components/common/Button';
import DataTable, { Column } from '../../components/common/DataTable';
import StockBadge from './components/StockBadge';
import ProductForm, { ProductFormData } from './components/ProductForm';
import DeleteConfirm from './components/DeleteConfirm';

// ─── Page ─────────────────────────────────────────────────────────────────────
const ProductManagement: React.FC = () => {
  const {
    products, loading,
    success, clearSuccess,
    submitProduct, removeProduct,
  } = useProducts();

  // ── Form modal ─────────────────────────────────────────────────────────────
  const [formOpen,       setFormOpen]       = useState(false);
  const [formLoading,    setFormLoading]    = useState(false);
  const [formError,      setFormError]      = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ── Delete modal ───────────────────────────────────────────────────────────
  const [deleteTarget,  setDeleteTarget]  = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Search ─────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openAdd   = ()            => { setEditingProduct(null); setFormError(''); setFormOpen(true); };
  const openEdit  = (p: Product)  => { setEditingProduct(p);    setFormError(''); setFormOpen(true); };
  const closeForm = ()            => { setFormOpen(false); setEditingProduct(null); };

  const handleSubmit = async (form: ProductFormData) => {
    setFormError('');
    setFormLoading(true);
    try {
      await submitProduct(form, editingProduct);
      closeForm();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await removeProduct(deleteTarget);
      setDeleteTarget(null);
    } catch {
      /* flash is handled inside the hook */
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product Name',
      render: (p) => <span className="text-gray-900 font-medium">{p.name}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (p) => {
        if (!p.expiryDate) {
          return <span className="text-gray-400 text-xs">—</span>;
        }
        // Use the backend-computed flags — no need to recalculate here.
        const colour = p.isExpired      ? 'text-red-600'    :
                       p.isExpiringSoon ? 'text-yellow-600'  :
                                          'text-gray-700';
        // Format the ISO string to a readable date
        const label = new Date(p.expiryDate).toLocaleDateString();
        return (
          <span className={`font-medium ${colour}`}>
            {label}
            {p.isExpired      && <span className="ml-1 text-xs">(Expired)</span>}
            {p.isExpiringSoon && !p.isExpired && <span className="ml-1 text-xs">(Soon)</span>}
          </span>
        );
      },
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
      render: (p) => (
        <span className="text-blue-600 font-medium">{p.wholesalePrice.toFixed(2)}</span>
      ),
    },
    {
      key: 'retailPrice',
      header: 'Retail (GH₵)',
      align: 'right',
      render: (p) => (
        <span className="text-green-600 font-medium">{p.retailPrice.toFixed(2)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openEdit(p)}
            title="Edit"
            className="p-1.5 bg-blue-50 text-blue-500 border border-blue-100 rounded-lg
              hover:bg-blue-100 hover:border-blue-300 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(p)}
            title="Delete"
            className="p-1.5 bg-red-50 text-red-500 border border-red-100 rounded-lg
              hover:bg-red-100 hover:border-red-300 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
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
                focus:outline-none focus:bg-white focus:border-orange-400
                focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
          <Button variant="primary" color="orange" icon={<Plus size={16} />} onClick={openAdd}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Success banner */}
      {success && <SuccessBanner message={success} onDismiss={clearSuccess} />}

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
            {!searchQuery && (
              <p className="text-gray-400 text-xs mt-1">
                Click "Add Product" to create your first product.
              </p>
            )}
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

      {/* Modals */}
      <ProductForm
        open={formOpen}
        editing={editingProduct}
        loading={formLoading}
        error={formError}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
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