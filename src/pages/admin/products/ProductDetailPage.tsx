import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Layers, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getProduct, updateProduct, getBatches } from '@/api/api';
import { Product } from '@/types';
import Button from '@/components/common/Button';
import { ErrorBanner, SuccessBanner } from '@/components/common/Banner';
import { ExpiryBadge } from '../inventory/components/ExpiryBadge';

interface BatchSummary {
  id:          string;
  name:        string | null;
  batchCode:   string;
  remaining:   number;
  expiryDate:  string | null;
  supplier:    string | null;
}

const inputCls = `w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
  text-sm focus:outline-none focus:bg-white focus:border-orange-400
  focus:ring-2 focus:ring-orange-100 transition-all`;

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Editable fields
  const [name,           setName]           = useState('');
  const [costPrice,      setCostPrice]      = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [retailPrice,    setRetailPrice]    = useState('');
  const [expiryDate,     setExpiryDate]     = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [prod, allBatches] = await Promise.all([
        getProduct(id),
        getBatches(),
      ]);

      setProduct(prod);
      setName(prod.name);
      setCostPrice(prod.costPrice.toString());
      setWholesalePrice(prod.wholesalePrice.toString());
      setRetailPrice(prod.retailPrice.toString());
      setExpiryDate(prod.expiryDate ?? '');

      // Filter batches that contain this product (legacy product_id OR multi-product list)
      const related = allBatches.filter((b: any) =>
        b.productId === id || b.products?.some((p: any) => p.productId === id)
      );
      setBatches(related);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load product.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!id) return;
    setError('');
    setSuccess('');

    const cost      = Number(costPrice);
    const wholesale = Number(wholesalePrice);
    const retail    = Number(retailPrice);

    if (!name.trim())                          { setError('Name is required.'); return; }
    if (Number.isNaN(cost) || cost < 0)        { setError('Cost price must be 0 or more.'); return; }
    if (Number.isNaN(wholesale) || wholesale < 0) { setError('Wholesale price must be 0 or more.'); return; }
    if (Number.isNaN(retail) || retail < 0)    { setError('Retail price must be 0 or more.'); return; }

    setSaving(true);
    try {
      const updated = await updateProduct(id, {
        name: name.trim(),
        costPrice: cost,
        wholesalePrice: wholesale,
        retailPrice: retail,
        expiry_date: expiryDate || null,
        quantity: product?.quantity ?? 0,
      });
      setProduct(updated);
      setSuccess('Product updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-400 text-sm">Loading product...</div>
    );
  }

  if (!product) {
    return (
      <div className="py-10 text-center text-gray-400 text-sm">Product not found.</div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          title="Back"
          className="p-2 rounded-xl border border-gray-200 text-gray-500
            hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
          <Package size={20} className="text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="text-gray-400 text-sm">Edit product details and view its batches</p>
        </div>
      </div>

      {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}
      {error   && <ErrorBanner   message={error}   onDismiss={() => setError('')}   />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Left: editable product fields ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">Product Details</h4>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Current Stock</label>
            <input
              type="text"
              value={product.quantity}
              disabled
              className={`${inputCls} text-gray-500`}
            />
            <p className="text-xs text-gray-400 mt-1">
              Use the Inventory Log to add or remove stock.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Cost Price</label>
              <input
                type="number" min="0" step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                disabled={saving}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Wholesale</label>
              <input
                type="number" min="0" step="0.01"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                disabled={saving}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Retail</label>
              <input
                type="number" min="0" step="0.01"
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                disabled={saving}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={saving}
              className={inputCls}
            />
            <div className="mt-2">
              <ExpiryBadge
                expiryDate={product.expiryDate ?? null}
                isExpired={product.isExpired ?? false}
                isExpiringSoon={product.isExpiringSoon ?? false}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              color="orange"
              icon={<Save size={16} />}
              loading={saving}
              onClick={handleSave}
              fullWidth
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* ── Right: batches containing this product ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-gray-400" />
            <h4 className="text-sm font-semibold text-gray-700">
              Batches ({batches.length})
            </h4>
          </div>

          {batches.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center border border-dashed
              border-gray-200 rounded-xl bg-gray-50 p-4 text-center">
              <Layers size={24} className="text-gray-300 mb-1" />
              <p className="text-xs font-medium text-gray-400">No batches linked yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {batches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/admin/batches/${b.id}`)}
                  className="w-full text-left bg-gray-50 hover:bg-orange-50 p-3 rounded-xl
                    border border-gray-100 hover:border-orange-200 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 group-hover:text-orange-600 truncate">
                        {b.name ?? 'Unnamed Batch'}
                      </p>
                      <p className="font-mono text-[10px] text-blue-500 font-semibold mt-0.5">
                        {b.batchCode}
                      </p>
                    </div>
                    <div className="text-right shrink-0 bg-white px-2.5 py-1.5 rounded-lg border border-gray-100">
                      <span className="text-[10px] uppercase text-gray-400 block font-semibold">Remaining</span>
                      <span className="text-xs font-bold text-gray-700 tabular-nums">
                        {b.remaining ?? 0} units
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1.5">
                    {b.supplier && <span>📦 {b.supplier}</span>}
                    {b.expiryDate && (
                      <span>⏳ Expires {format(parseISO(b.expiryDate), 'dd MMM yyyy')}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;