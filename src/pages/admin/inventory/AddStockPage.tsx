import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, PackagePlus } from 'lucide-react';
import { getProducts, getBatches, restockMultiple } from '@/api/api.ts';
import { Product } from '@/types';
import Button from '@/components/common/Button';
import { SuccessBanner } from '@/components/common/Banner';
import { AddStockForm } from './components/AddStockForm';

interface Batch {
  id:   string;
  name?: string | null;
  batchCode: string;
  productId?: string;
}

const AddStockPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('productId') ?? undefined;

  const [products, setProducts] = useState<Product[]>([]);
  const [batches,  setBatches]  = useState<Batch[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  const load = useCallback(async () => {
    setPageLoading(true);
    try {
      const [prods, batchRows] = await Promise.all([getProducts(), getBatches()]);
      setProducts(prods);
      setBatches(batchRows);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (payload: {
    products: { productId: string; quantity: number; unitCost?: number; expiry_date?: string }[];
    note: string;
    createBatch: boolean;
    batchDescription: string;
    existingBatchId: string;
    supplier: string;
    expiry_date: string;
  }) => {
    setError('');

    if (payload.products.length === 0) {
      setError('Add at least one product.'); return;
    }
    for (const [i, p] of payload.products.entries()) {
      if (!p.productId)                  { setError(`Row ${i + 1}: select a product.`); return; }
      if (!p.quantity || p.quantity < 1) { setError(`Row ${i + 1}: quantity must be at least 1.`); return; }
    }
    if (payload.createBatch && !payload.batchDescription.trim()) {
      setError('Batch description is required.'); return;
    }

    setLoading(true);
    try {
      await restockMultiple({
        products: payload.products,
        note: payload.note,
        expiry_date: payload.expiry_date || undefined,
        createBatch: payload.createBatch,
        batchDescription: payload.createBatch ? payload.batchDescription.trim() : undefined,
        existingBatchId: !payload.createBatch ? payload.existingBatchId || undefined : undefined,
        supplier: payload.supplier.trim() || undefined,
      });

      setSuccess('Stock added successfully.');
      // Give the user a moment to see the success message, then return to the log
      setTimeout(() => navigate('/admin/inventory'), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/inventory')}
          title="Back to Inventory Log"
          className="p-2 rounded-xl border border-gray-200 text-gray-500
            hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-xl">
          <PackagePlus size={20} className="text-orange-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Add Stock</h3>
          <p className="text-gray-400 text-sm">Restock one or more products, optionally as a batch</p>
        </div>
      </div>

      {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}

      {pageLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-10 text-center text-gray-400 text-sm">
          Loading...
        </div>
      ) : (
        <AddStockForm
          open
          showHeader={false}
          products={products}
          batches={batches}
          loading={loading}
          error={error}
          preselectedId={preselectedId}
          onClose={() => navigate('/admin/inventory')}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default AddStockPage;