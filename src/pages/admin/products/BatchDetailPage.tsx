import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Layers, Save, X } from 'lucide-react';
import { getBatch, updateBatch, getProducts } from '@/api/api';
import { Product } from '@/types';
import Button from '@/components/common/Button';
import { ErrorBanner, SuccessBanner } from '@/components/common/Banner';

interface BatchProductLine {
  productId:   string;
  productName: string | null;
  quantity:    string;
  unitCost:    string;
}

interface BatchDetail {
  id:         string;
  name:       string | null;
  batchCode:  string;
  supplier:   string | null;
  expiryDate: string | null;
  note:       string | null;
  totalCost:  number | null;
  products:   { productId: string; productName: string | null; quantity: number; unitCost: number; totalCost: number }[];
}

const inputCls = `w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
  text-sm focus:outline-none focus:bg-white focus:border-orange-400
  focus:ring-2 focus:ring-orange-100 transition-all`;

const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [batch,    setBatch]    = useState<BatchDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  // Editable fields
  const [name,       setName]       = useState('');
  const [supplier,   setSupplier]   = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [note,       setNote]       = useState('');
  const [lines,      setLines]      = useState<BatchProductLine[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [data, allProducts] = await Promise.all([
        getBatch(id),
        getProducts(),
      ]);

      setBatch(data);
      setName(data.name ?? '');
      setSupplier(data.supplier ?? '');
      setExpiryDate(data.expiryDate ?? '');
      setNote(data.note ?? '');
      setLines(
        (data.products ?? []).map((p: any) => ({
          productId:   p.productId,
          productName: p.productName,
          quantity:    p.quantity.toString(),
          unitCost:    p.unitCost.toString(),
        }))
      );
      setProducts(allProducts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load batch.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateLine = (index: number, field: 'quantity' | 'unitCost', value: string) =>
    setLines(cur => cur.map((l, i) => i === index ? { ...l, [field]: value } : l));

  const removeLine = (index: number) =>
    setLines(cur => cur.filter((_, i) => i !== index));

  const addLine = () =>
    setLines(cur => [...cur, { productId: '', productName: null, quantity: '', unitCost: '' }]);

  const updateLineProduct = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    setLines(cur => cur.map((l, i) => i === index ? {
      ...l,
      productId,
      productName: product?.name ?? null,
      unitCost: l.unitCost || (product ? product.costPrice.toString() : ''),
    } : l));
  };

  const grandTotal = lines.reduce((sum, l) => {
    const qty  = Number.parseInt(l.quantity || '0', 10);
    const cost = Number(l.unitCost || '0');
    return sum + (Number.isNaN(qty) ? 0 : qty) * (Number.isNaN(cost) ? 0 : cost);
  }, 0);

  const handleSave = async () => {
    if (!id) return;
    setError('');
    setSuccess('');

    if (lines.length === 0) { setError('A batch must have at least one product.'); return; }

    for (const [i, l] of lines.entries()) {
      if (!l.productId)                                    { setError(`Row ${i + 1}: select a product.`); return; }
      const qty  = Number.parseInt(l.quantity, 10);
      const cost = Number(l.unitCost);
      if (!l.quantity || Number.isNaN(qty) || qty < 1)    { setError(`Row ${i + 1}: quantity must be at least 1.`); return; }
      if (!l.unitCost || Number.isNaN(cost) || cost < 0)  { setError(`Row ${i + 1}: unit cost must be 0 or more.`); return; }
    }

    // Check for duplicate products
    const ids = lines.map(l => l.productId);
    if (new Set(ids).size !== ids.length) {
      setError('Each product can only appear once in a batch.'); return;
    }

    setSaving(true);
    try {
      const updated = await updateBatch(id, {
        name: name.trim() || null,
        supplier: supplier.trim() || null,
        expiryDate: expiryDate || null,
        note: note.trim() || null,
        products: lines.map(l => ({
          productId: l.productId,
          quantity:  Number.parseInt(l.quantity, 10),
          unitCost:  Number(l.unitCost),
        })),
      });
      setBatch(updated);
      setSuccess('Batch updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update batch.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-gray-400 text-sm">Loading batch...</div>;
  }

  if (!batch) {
    return <div className="py-10 text-center text-gray-400 text-sm">Batch not found.</div>;
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
          <Layers size={20} className="text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{batch.name ?? 'Unnamed Batch'}</h3>
          <p className="font-mono text-xs text-gray-400">{batch.batchCode}</p>
        </div>
      </div>

      {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}
      {error   && <ErrorBanner   message={error}   onDismiss={() => setError('')}   />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Left: batch meta fields ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">Batch Details</h4>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Batch Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              className={inputCls}
              placeholder="e.g. May supplement delivery"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Supplier</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              disabled={saving}
              className={inputCls}
              placeholder="Supplier name"
            />
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={saving}
              className={`${inputCls} min-h-24 resize-none`}
              placeholder="Optional note"
            />
          </div>
        </div>

        {/* ── Right: products in this batch ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">Products in this batch</h4>
            <button
              type="button"
              onClick={addLine}
              disabled={saving}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold
                disabled:opacity-40 transition-colors"
            >
              + Add product
            </button>
          </div>

          <div className="space-y-2">
            {lines.map((line, i) => {
              const qty  = Number.parseInt(line.quantity || '0', 10);
              const cost = Number(line.unitCost || '0');
              const lineTotal = (Number.isNaN(qty) ? 0 : qty) * (Number.isNaN(cost) ? 0 : cost);

              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  {/* Product */}
                  <div className="col-span-5">
                    {i === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>}
                    <select
                      value={line.productId}
                      onChange={(e) => updateLineProduct(i, e.target.value)}
                      disabled={saving}
                      className={inputCls}
                    >
                      <option value="">Select product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    {i === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>}
                    <input
                      type="number" min="1"
                      value={line.quantity}
                      onChange={(e) => updateLine(i, 'quantity', e.target.value)}
                      disabled={saving}
                      className={inputCls}
                      placeholder="0"
                    />
                  </div>

                  {/* Unit cost */}
                  <div className="col-span-2">
                    {i === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">Unit Cost</label>}
                    <input
                      type="number" min="0" step="0.01"
                      value={line.unitCost}
                      onChange={(e) => updateLine(i, 'unitCost', e.target.value)}
                      disabled={saving}
                      className={inputCls}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Line total */}
                  <div className="col-span-2">
                    {i === 0 && <label className="block text-xs font-medium text-gray-600 mb-1">Total</label>}
                    <input
                      type="text"
                      value={`GH₵${lineTotal.toFixed(2)}`}
                      disabled
                      className={`${inputCls} text-gray-500`}
                    />
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex items-end">
                    {i === 0 && <div className="mb-1 h-4" />}
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      disabled={saving || lines.length === 1}
                      title="Remove row"
                      className="w-8 h-9 flex items-center justify-center rounded-lg text-gray-400
                        hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed
                        transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-1 border-t border-gray-100">
            <span className="text-sm text-gray-500 mr-2 pt-2">Batch Total:</span>
            <span className="text-sm font-semibold text-gray-900 pt-2">GH₵{grandTotal.toFixed(2)}</span>
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

      </div>
    </div>
  );
};

export default BatchDetailPage;