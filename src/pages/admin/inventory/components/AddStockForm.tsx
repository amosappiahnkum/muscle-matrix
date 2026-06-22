import React, { useState, useEffect } from 'react';
import { ChevronUp, Plus, X } from 'lucide-react';
import {
  Select, InputNumber, DatePicker, Input,
  Checkbox, Typography, Divider,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Product } from '@/types';
import Button from '@/components/common/Button';
import { ErrorBanner } from '@/components/common/Banner';
import { StockLevel } from './StockLevel';

const { Text } = Typography;

interface Batch {
  id:        string;
  name?:     string | null;
  batchCode: string;
}

interface ProductLine {
  productId:  string;
  quantity:   string;
  unitCost:   string;
  expiryDate: string;
}

const emptyLine = (): ProductLine => ({
  productId: '', quantity: '', unitCost: '', expiryDate: '',
});

interface AddStockFormProps {
  open:           boolean;
  products:       Product[];
  batches:        Batch[];
  loading:        boolean;
  error:          string;
  preselectedId?: string;
  onClose:        () => void;
  showHeader?:    boolean;
  onSubmit: (payload: {
    products: { productId: string; quantity: number; unitCost?: number; expiry_date?: string }[];
    note:             string;
    createBatch:      boolean;
    batchDescription: string;
    existingBatchId:  string;
    supplier:         string;
  }) => void;
}

export const AddStockForm: React.FC<AddStockFormProps> = ({
  open,
  products,
  batches,
  loading,
  error,
  preselectedId,
  onClose,
  showHeader = true,
  onSubmit,
}) => {
  const [lines, setLines]                       = useState<ProductLine[]>([emptyLine()]);
  const [note, setNote]                         = useState('');
  const [createBatch, setCreateBatch]           = useState(false);
  const [batchDescription, setBatchDescription] = useState('');
  const [existingBatchId, setExistingBatchId]   = useState('');
  const [supplier, setSupplier]                 = useState('');

  // Reset form when opened
  useEffect(() => {
    if (!open) return;
    const first = emptyLine();
    if (preselectedId) first.productId = preselectedId;
    setLines([first]);
    setNote('');
    setCreateBatch(false);
    setBatchDescription('');
    setExistingBatchId('');
    setSupplier('');
  }, [open, preselectedId]);

  if (!open) return null;

  const updateLine = (index: number, field: keyof ProductLine, value: string) =>
    setLines(cur => cur.map((l, i) => i === index ? { ...l, [field]: value } : l));

  const addLine    = () => setLines(cur => [...cur, emptyLine()]);
  const removeLine = (index: number) => setLines(cur => cur.filter((_, i) => i !== index));

  const grandTotal = lines.reduce((sum, l) => {
    const qty  = Number.parseInt(l.quantity || '0', 10);
    const cost = Number(l.unitCost || '0');
    return sum + (isNaN(qty) ? 0 : qty) * (isNaN(cost) ? 0 : cost);
  }, 0);

  const handleSubmit = () => {
    onSubmit({
      products: lines.map(l => ({
        productId:   l.productId,
        quantity:    Number.parseInt(l.quantity || '0', 10),
        unitCost:    l.unitCost ? Number(l.unitCost) : undefined,
        expiry_date: l.expiryDate || undefined,
      })),
      note,
      createBatch,
      batchDescription,
      existingBatchId,
      supplier,
    });
  };

  // Build Select options with search support
  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.name} — stock: ${p.quantity}`,
    product: p,
  }));

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      {showHeader && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid #f3f4f6',
          background: '#f9fafb',
        }}>
          <Text strong style={{ fontSize: 14, color: '#1f2937' }}>Add Stock</Text>
          <button
            onClick={onClose}
            style={{
              padding: '4px 6px',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Collapse"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      )}

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && <ErrorBanner message={error} />}

        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 1fr 1fr 1.2fr 1.2fr auto',
          gap: 8,
          padding: '0 4px',
        }}>
          {['Product', 'Qty', 'Unit Cost', 'Expiry', 'Line Total', ''].map((h, i) => (
            <Text key={i} style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textAlign: i >= 2 ? 'right' : 'left' }}>
              {h}
            </Text>
          ))}
        </div>

        {/* Product lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lines.map((line, i) => {
            const selected  = products.find(p => p.id === line.productId);
            const qty       = Number.parseInt(line.quantity || '0', 10);
            const cost      = Number(line.unitCost || '0');
            const lineTotal = (isNaN(qty) ? 0 : qty) * (isNaN(cost) ? 0 : cost);

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 1fr 1fr 1.2fr 1.2fr auto',
                  gap: 8,
                  alignItems: 'center',
                }}>
                  {/* Product — searchable */}
                  <Select
                    showSearch
                    value={line.productId || undefined}
                    placeholder="Search product…"
                    disabled={loading}
                    onChange={(val) => updateLine(i, 'productId', val)}
                    optionFilterProp="label"
                    options={productOptions}
                    filterOption={(input, option) =>
                      (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    style={{ width: '100%' }}
                    size="middle"
                  />

                  {/* Quantity */}
                  <InputNumber
                    min={1}
                    value={line.quantity ? Number(line.quantity) : undefined}
                    onChange={(val) => updateLine(i, 'quantity', val?.toString() ?? '')}
                    disabled={loading}
                    placeholder="0"
                    style={{ width: '100%' }}
                    controls={false}
                  />

                  {/* Unit cost */}
                  <InputNumber
                    min={0}
                    step={0.01}
                    precision={2}
                    value={line.unitCost ? Number(line.unitCost) : undefined}
                    onChange={(val) => updateLine(i, 'unitCost', val?.toString() ?? '')}
                    disabled={loading}
                    placeholder={selected ? selected.costPrice.toFixed(2) : '0.00'}
                    style={{ width: '100%' }}
                    controls={false}
                  />

                  {/* Expiry */}
                  <DatePicker
                    value={line.expiryDate ? dayjs(line.expiryDate) : null}
                    onChange={(date: Dayjs | null) =>
                      updateLine(i, 'expiryDate', date ? date.format('YYYY-MM-DD') : '')
                    }
                    disabled={loading}
                    format="YYYY-MM-DD"
                    placeholder="Expiry"
                    style={{ width: '100%' }}
                    disabledDate={(d) => d.isBefore(dayjs(), 'day')}
                  />

                  {/* Line total (read-only) */}
                  <Input
                    value={`GH₵${lineTotal.toFixed(2)}`}
                    disabled
                    style={{ textAlign: 'right', color: '#6b7280' }}
                  />

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    disabled={loading || lines.length === 1}
                    title="Remove row"
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      color: '#9ca3af',
                      cursor: lines.length === 1 ? 'not-allowed' : 'pointer',
                      opacity: lines.length === 1 ? 0.3 : 1,
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { if (lines.length > 1) (e.currentTarget.style.color = '#ef4444'); (e.currentTarget.style.background = '#fef2f2'); }}
                    onMouseLeave={(e) => { (e.currentTarget.style.color = '#9ca3af'); (e.currentTarget.style.background = 'transparent'); }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Stock level badge below product select */}
                {selected && (
                  <div style={{ paddingLeft: 4 }}>
                    <StockLevel qty={selected.quantity} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add row + grand total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={addLine}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#f97316',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              opacity: loading ? 0.4 : 1,
            }}
          >
            <Plus size={13} /> Add another product
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 13, color: '#6b7280' }}>Grand Total:</Text>
            <Text strong style={{ fontSize: 13, color: '#111827' }}>GH₵{grandTotal.toFixed(2)}</Text>
          </div>
        </div>

        <Divider style={{ margin: '0' }} />

        {/* Note */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Note
          </label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Supplier delivery…"
            disabled={loading}
            size="large"
          />
        </div>

        {/* Batch section */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <Checkbox
            checked={createBatch}
            onChange={(e) => { setCreateBatch(e.target.checked); setExistingBatchId(''); }}
            disabled={loading}
          >
            <Text strong style={{ fontSize: 13 }}>Create New Batch</Text>
          </Checkbox>

          {!createBatch && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>
                Add To Existing Batch
              </label>
              <Select
                value={existingBatchId || undefined}
                onChange={setExistingBatchId}
                disabled={loading}
                placeholder="Select batch"
                style={{ width: '100%' }}
                options={batches.map(b => ({ value: b.id, label: b.name || 'Unnamed batch' }))}
              />
            </div>
          )}

          {createBatch && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>
                  Batch Description
                </label>
                <Input
                  value={batchDescription}
                  onChange={(e) => setBatchDescription(e.target.value)}
                  placeholder="May whey shipment"
                  disabled={loading}
                  size="large"
                />
                <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, display: 'block' }}>
                  Batch code will generate automatically
                </Text>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>
                  Supplier
                </label>
                <Input
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Supplier name"
                  disabled={loading}
                  size="large"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" color="orange" fullWidth loading={loading} onClick={handleSubmit}>
            Add Stock
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddStockForm;