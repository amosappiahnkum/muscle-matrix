import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ReceiptText, Save, Plus, X, ShoppingCart, Truck, ChevronRight } from 'lucide-react';
import { Select, InputNumber, Input, Typography, Segmented, Spin, Divider } from 'antd';
import { Product, ExpenseBatch, Expense } from '@/types';
import Button from '@/components/common/Button';
import { ErrorBanner, SuccessBanner } from '@/components/common/Banner';
import { BatchProductEntry, ExpenseFormData, ExpenseMode, AdditionalExpense } from './useExpenses';
import {
  getExpense,
  getSuppliers, Supplier,
  getCategories, Category,
  searchSuppliers, searchCategories,
} from '@/api/api';
import { useExpenses } from './useExpenses';

const { Text } = Typography;

// ── On-the-way expense (local form state) ─────────────────────────────────────

export interface OnWayExpense {
  tempId:      string;
  category:    string;
  description: string;
  amount:      string;
}

// ── Label ─────────────────────────────────────────────────────────────────────

const Label: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
    {children}
    {hint && <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 4, fontSize: 12 }}>{hint}</span>}
  </label>
);

// ── Product row ───────────────────────────────────────────────────────────────

interface ProductRowProps {
  row:       BatchProductEntry;
  index:     number;
  products:  Product[];
  canRemove: boolean;
  disabled:  boolean;
  onChange:  (field: keyof BatchProductEntry, value: string) => void;
  onRemove:  () => void;
}

const ProductRow: React.FC<ProductRowProps> = ({
  row, index, products, canRemove, disabled, onChange, onRemove,
}) => {
  const qty      = Number.parseInt(row.quantity || '0', 10);
  const cost     = Number(row.unitCost || '0');
  const rowTotal = (Number.isNaN(qty) ? 0 : qty) * (Number.isNaN(cost) ? 0 : cost);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.2fr 1.2fr auto', gap: 8, alignItems: 'center' }}>
      <Select
        showSearch
        value={row.productId || undefined}
        placeholder="Search product…"
        disabled={disabled}
        onChange={(val) => onChange('productId', val)}
        optionFilterProp="label"
        options={products.map(p => ({ value: p.id, label: p.name }))}
        filterOption={(input, option) =>
          (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
        }
        style={{ width: '100%' }}
      />
      <InputNumber
        min={1}
        value={row.quantity ? Number(row.quantity) : undefined}
        onChange={(val) => onChange('quantity', val?.toString() ?? '')}
        disabled={disabled} placeholder="0"
        style={{ width: '100%' }} controls={false}
      />
      <InputNumber
        min={0} step={0.01} precision={2}
        value={row.unitCost ? Number(row.unitCost) : undefined}
        onChange={(val) => onChange('unitCost', val?.toString() ?? '')}
        disabled={disabled} placeholder="0.00"
        style={{ width: '100%' }} controls={false}
      />
      <Input
        value={`GH₵${rowTotal.toFixed(2)}`}
        disabled style={{ textAlign: 'right', color: '#6b7280' }}
      />
      <button
        type="button" onClick={onRemove} disabled={disabled || !canRemove}
        style={{
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, border: 'none', background: 'transparent', color: '#9ca3af',
          cursor: !canRemove ? 'not-allowed' : 'pointer', opacity: !canRemove ? 0.3 : 1, flexShrink: 0,
        }}
        onMouseEnter={(e) => { if (canRemove) { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
      >
        <X size={14} />
      </button>
    </div>
  );
};

const ProductRowHeaders: React.FC = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.2fr 1.2fr auto', gap: 8, padding: '0 4px' }}>
    {['Product', 'Qty', 'Unit Cost', 'Total', ''].map((h, i) => (
      <Text key={i} style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>{h}</Text>
    ))}
  </div>
);

// ── On-the-way row ────────────────────────────────────────────────────────────

interface OnWayRowProps {
  row:        OnWayExpense;
  categories: Category[];
  catLoading: boolean;
  onCatSearch:(v: string) => void;
  canRemove:  boolean;
  disabled:   boolean;
  onChange:   (field: keyof Omit<OnWayExpense, 'tempId'>, value: string) => void;
  onRemove:   () => void;
}

const OnWayRow: React.FC<OnWayRowProps> = ({
  row, categories, catLoading, onCatSearch, canRemove, disabled, onChange, onRemove,
}) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 2fr 1fr auto', gap: 8, alignItems: 'center' }}>
    <Select
      showSearch
      value={row.category || undefined}
      placeholder="Category…"
      disabled={disabled}
      loading={catLoading}
      onSearch={onCatSearch}
      onChange={(val) => onChange('category', val)}
      filterOption={false}
      options={categories.map(c => ({ value: c.name, label: c.name }))}
      style={{ width: '100%' }}
      notFoundContent={catLoading ? <Spin size="small" /> : 'No categories'}
      allowClear
    />
    <Input
      value={row.description}
      onChange={(e) => onChange('description', e.target.value)}
      disabled={disabled}
      placeholder="e.g. Truck hire, loading fee…"
    />
    <InputNumber
      min={0} step={0.01} precision={2}
      value={row.amount ? Number(row.amount) : undefined}
      onChange={(val) => onChange('amount', val?.toString() ?? '')}
      disabled={disabled} placeholder="0.00"
      style={{ width: '100%' }} controls={false}
    />
    <button
      type="button" onClick={onRemove} disabled={disabled || !canRemove}
      style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 8, border: 'none', background: 'transparent', color: '#9ca3af',
        cursor: !canRemove ? 'not-allowed' : 'pointer', opacity: !canRemove ? 0.3 : 1, flexShrink: 0,
      }}
      onMouseEnter={(e) => { if (canRemove) { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
    >
      <X size={14} />
    </button>
  </div>
);

// ── Summary bar ───────────────────────────────────────────────────────────────

const SummaryBar: React.FC<{ productsTotal: number; onWayTotal: number }> = ({
  productsTotal, onWayTotal,
}) => {
  const grand = productsTotal + onWayTotal;
  return (
    <div style={{
      background: '#f8fafc', border: '1px solid #e2e8f0',
      borderRadius: 10, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShoppingCart size={13} style={{ color: '#6b7280' }} />
          <Text style={{ fontSize: 13, color: '#6b7280' }}>Products total</Text>
        </div>
        <Text style={{ fontSize: 13, color: '#374151', fontVariantNumeric: 'tabular-nums' }}>
          GH₵{productsTotal.toFixed(2)}
        </Text>
      </div>
      {onWayTotal > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Truck size={13} style={{ color: '#6b7280' }} />
            <Text style={{ fontSize: 13, color: '#6b7280' }}>On-the-way costs</Text>
          </div>
          <Text style={{ fontSize: 13, color: '#374151', fontVariantNumeric: 'tabular-nums' }}>
            + GH₵{onWayTotal.toFixed(2)}
          </Text>
        </div>
      )}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
        <Text strong style={{ fontSize: 14, color: '#111827' }}>Grand total</Text>
        <Text strong style={{ fontSize: 16, color: '#f97316', fontVariantNumeric: 'tabular-nums' }}>
          GH₵{grand.toFixed(2)}
        </Text>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

interface ExpenseFormPageProps {
  editing:              Expense | null;
  form:                 ExpenseFormData;
  products:             Product[];
  batches:              ExpenseBatch[];
  loading:              boolean;
  error:                string;
  success:              string;
  onWayExpenses:        OnWayExpense[];
  onChange:             (key: keyof ExpenseFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onModeChange:         (mode: ExpenseMode) => void;
  onBatchProductChange: (index: number, field: keyof BatchProductEntry, value: string) => void;
  onAddBatchProduct:    () => void;
  onRemoveBatchProduct: (index: number) => void;
  onAddOnWay:           () => void;
  onRemoveOnWay:        (index: number) => void;
  onOnWayChange:        (index: number, field: keyof Omit<OnWayExpense, 'tempId'>, value: string) => void;
  onSubmit:             () => void;
  onCancel:             () => void;
  onDismissError:       () => void;
  onDismissSuccess:     () => void;
}

export const ExpenseFormPage: React.FC<ExpenseFormPageProps> = ({
  editing, form, products, batches, loading,
  error, success, onWayExpenses,
  onChange, onModeChange,
  onBatchProductChange, onAddBatchProduct, onRemoveBatchProduct,
  onAddOnWay, onRemoveOnWay, onOnWayChange,
  onSubmit, onCancel, onDismissError, onDismissSuccess,
}) => {
  const isBatch = form.mode === 'inventory_batch';

  // ── Suppliers ─────────────────────────────────────────────────────────────
  const [suppliers,        setSuppliers]        = useState<Supplier[]>([]);
  const [supplierSearch,   setSupplierSearch]   = useState('');
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  const loadSuppliers = useCallback(async (search = '') => {
    setSuppliersLoading(true);
    try {
      const data = search ? await searchSuppliers(search) : await getSuppliers();
      setSuppliers(data);
    } catch { /* silently fail */ }
    finally { setSuppliersLoading(false); }
  }, []);

  useEffect(() => { loadSuppliers(); }, [loadSuppliers]);
  useEffect(() => {
    const t = setTimeout(() => loadSuppliers(supplierSearch), 300);
    return () => clearTimeout(t);
  }, [supplierSearch, loadSuppliers]);

  // ── Categories ────────────────────────────────────────────────────────────
  const [categories,        setCategories]        = useState<Category[]>([]);
  const [categorySearch,    setCategorySearch]    = useState('');
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const loadCategories = useCallback(async (search = '') => {
    setCategoriesLoading(true);
    try {
      const data = search ? await searchCategories(search) : await getCategories();
      setCategories(data);
    } catch { /* silently fail */ }
    finally { setCategoriesLoading(false); }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => {
    const t = setTimeout(() => loadCategories(categorySearch), 300);
    return () => clearTimeout(t);
  }, [categorySearch, loadCategories]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const productsTotal = form.batchProducts.reduce((sum, row) => {
    const qty  = Number.parseInt(row.quantity || '0', 10);
    const cost = Number(row.unitCost || '0');
    return sum + (Number.isNaN(qty) ? 0 : qty) * (Number.isNaN(cost) ? 0 : cost);
  }, 0);

  const onWayTotal = onWayExpenses.reduce((sum, row) => {
    const amt = Number(row.amount || '0');
    return sum + (Number.isNaN(amt) ? 0 : amt);
  }, 0);

  // ── Bridges ───────────────────────────────────────────────────────────────
  const antdSelect = (key: keyof ExpenseFormData) => (val: string) =>
    onChange(key)({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>);

  const antdNumber = (key: keyof ExpenseFormData) => (val: number | null) =>
    onChange(key)({ target: { value: val?.toString() ?? '' } } as React.ChangeEvent<HTMLInputElement>);

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onCancel}
          style={{
            padding: 8, borderRadius: 12, border: '1px solid #e5e7eb',
            background: 'transparent', color: '#6b7280', cursor: 'pointer',
            display: 'flex', alignItems: 'center', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#111827'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: 10, display: 'flex' }}>
          <ReceiptText size={20} style={{ color: '#f97316' }} />
        </div>
        <div>
          <Text strong style={{ fontSize: 18, color: '#111827', display: 'block' }}>
            {editing ? 'Edit Expense' : 'Add Expense'}
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {editing ? 'Update the details of this expense' : 'Record a new expense or inventory purchase'}
          </Text>
        </div>
      </div>

      {success && <SuccessBanner message={success} onDismiss={onDismissSuccess} />}
      {error   && <ErrorBanner   message={error}   onDismiss={onDismissError}   />}

      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 20,
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>

        {/* Mode toggle — create only */}
        {!editing && (
          <Segmented
            value={form.mode}
            onChange={(val) => onModeChange(val as ExpenseMode)}
            options={[
              { label: 'Custom', value: 'custom'          },
              { label: 'Batch',  value: 'inventory_batch' },
            ]}
            block style={{ fontWeight: 600 }}
          />
        )}

        {/* Supplier — batch only, not shown when editing (name is on the batch already) */}
        {isBatch && !editing && (
          <div>
            <Label>Supplier</Label>
            <Select
              showSearch
              value={form.supplier || undefined}
              placeholder="Search supplier…"
              disabled={loading}
              loading={suppliersLoading}
              onSearch={setSupplierSearch}
              onChange={antdSelect('supplier')}
              filterOption={false}
              options={suppliers.map(s => ({ value: s.name, label: s.name }))}
              style={{ width: '100%' }} size="large" allowClear
              notFoundContent={suppliersLoading ? <Spin size="small" /> : 'No suppliers found'}
            />
          </div>
        )}

        {/* ── Products section — shown for all batch modes including edit ─── */}
        {isBatch && (
          <div style={{
            background: '#fafafa', borderRadius: 10,
            border: '1px solid #f0f0f0', padding: 14,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart size={14} style={{ color: '#f97316' }} />
              <Text strong style={{ fontSize: 13, color: '#374151' }}>Products</Text>
              <div style={{ flex: 1 }} />
              <button
                type="button" onClick={onAddBatchProduct} disabled={loading}
                style={{
                  background: 'none', border: 'none', color: '#f97316',
                  fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  opacity: loading ? 0.4 : 1,
                }}
              >
                <Plus size={13} /> Add product
              </button>
            </div>

            <ProductRowHeaders />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.batchProducts.map((row, i) => (
                <ProductRow
                  key={i} index={i} row={row} products={products}
                  canRemove={form.batchProducts.length > 1} disabled={loading}
                  onChange={(field, value) => onBatchProductChange(i, field, value)}
                  onRemove={() => onRemoveBatchProduct(i)}
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, paddingTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Products subtotal</Text>
              <ChevronRight size={12} style={{ color: '#d1d5db' }} />
              <Text strong style={{ fontSize: 13, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                GH₵{productsTotal.toFixed(2)}
              </Text>
            </div>
          </div>
        )}

        {/* ── On-the-way costs — shown for all batch modes including edit ── */}
        {isBatch && (
          <div style={{
            background: '#fafafa', borderRadius: 10,
            border: '1px solid #f0f0f0', padding: 14,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck size={14} style={{ color: '#6b7280' }} />
              <div>
                <Text strong style={{ fontSize: 13, color: '#374151' }}>On-the-way costs</Text>
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                  transport, loading, other purchasing costs
                </Text>
              </div>
              <div style={{ flex: 1 }} />
              <button
                type="button" onClick={onAddOnWay} disabled={loading}
                style={{
                  background: 'none', border: 'none', color: '#6b7280',
                  fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  opacity: loading ? 0.4 : 1,
                }}
              >
                <Plus size={13} /> Add cost
              </button>
            </div>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 2fr 1fr auto', gap: 8, padding: '0 4px' }}>
              {['Category', 'Description', 'Amount', ''].map((h, i) => (
                <Text key={i} style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>{h}</Text>
              ))}
            </div>

            {onWayExpenses.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12, padding: '4px 4px' }}>
                No on-the-way costs yet. Click "Add cost" to record transport, loading fees, etc.
              </Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {onWayExpenses.map((row, i) => (
                  <OnWayRow
                    key={row.tempId}
                    row={row}
                    categories={categories}
                    catLoading={categoriesLoading}
                    onCatSearch={setCategorySearch}
                    canRemove={true}
                    disabled={loading}
                    onChange={(field, value) => onOnWayChange(i, field, value)}
                    onRemove={() => onRemoveOnWay(i)}
                  />
                ))}
              </div>
            )}

            {onWayTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, paddingTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>On-the-way subtotal</Text>
                <ChevronRight size={12} style={{ color: '#d1d5db' }} />
                <Text strong style={{ fontSize: 13, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                  GH₵{onWayTotal.toFixed(2)}
                </Text>
              </div>
            )}
          </div>
        )}

        {/* Summary — batch only */}
        {isBatch && (
          <SummaryBar productsTotal={productsTotal} onWayTotal={onWayTotal} />
        )}

        <Divider style={{ margin: '4px 0' }} />

        {/* Description */}
        <div>
          <Label hint="(optional)">Description</Label>
          <Input
            value={form.description}
            onChange={onChange('description')}
            disabled={loading}
            placeholder={isBatch ? 'Inventory purchase' : 'Electric bill'}
            size="large"
          />
        </div>

        {/* Amount + Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {!isBatch && (
            <div>
              <Label>Amount</Label>
              <InputNumber
                min={0} step={0.01} precision={2}
                value={form.amount ? Number(form.amount) : undefined}
                onChange={antdNumber('amount')}
                disabled={loading} placeholder="0.00"
                style={{ width: '100%' }} size="large" controls={false}
              />
            </div>
          )}
          <div style={{ gridColumn: isBatch ? '1 / -1' : undefined }}>
            <Label>Category</Label>
            <Select
              showSearch
              value={form.category || undefined}
              placeholder="Search category…"
              disabled={loading}
              loading={categoriesLoading}
              onSearch={setCategorySearch}
              onChange={antdSelect('category')}
              filterOption={false}
              options={categories.map(c => ({ value: c.name, label: c.name }))}
              style={{ width: '100%' }} size="large" allowClear
              notFoundContent={categoriesLoading ? <Spin size="small" /> : 'No categories found'}
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <Label hint="(optional)">Note</Label>
          <Input.TextArea
            value={form.note}
            onChange={onChange('note')}
            disabled={loading}
            placeholder="Optional note"
            autoSize={{ minRows: 3 }}
            style={{ resize: 'none' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
          <Button variant="secondary" size="md" fullWidth onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary" color="orange" size="md" fullWidth
            icon={<Save size={16} />} loading={loading} onClick={onSubmit}
          >
            {editing ? 'Update Expense' : 'Save Expense'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Route wrapper ─────────────────────────────────────────────────────────────

const ExpenseFormRoute: React.FC = () => {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const isEdit   = !!id;

  const {
    products, batches, saving, error, success, editing, form,
    setError, setSuccess, setField, onModeChange,
    openEdit, closeForm, handleSubmit,
    setBatchProductField, addBatchProduct, removeBatchProduct,
  } = useExpenses();

  const [pageLoading,  setPageLoading]  = useState(isEdit);
  const [loadError,    setLoadError]    = useState('');
  const [onWayExpenses, setOnWayExpenses] = useState<OnWayExpense[]>([]);

  // ── On-the-way helpers ────────────────────────────────────────────────────
  const addOnWay = () =>
    setOnWayExpenses(prev => [
      ...prev,
      { tempId: crypto.randomUUID(), category: '', description: '', amount: '' },
    ]);

  const removeOnWay = (index: number) =>
    setOnWayExpenses(prev => prev.filter((_, i) => i !== index));

  const changeOnWay = (
    index: number,
    field: keyof Omit<OnWayExpense, 'tempId'>,
    value: string,
  ) =>
    setOnWayExpenses(prev =>
      prev.map((row, i) => i === index ? { ...row, [field]: value } : row)
    );

  // Reset on-the-way when switching to custom mode
  useEffect(() => {
    if (form.mode !== 'inventory_batch') setOnWayExpenses([]);
  }, [form.mode]);

  // Load expense and seed on-the-way costs from existing purchasingCosts
  useEffect(() => {
    if (!isEdit || !id) return;
    setPageLoading(true);
    getExpense(id)
      .then((expense) => {
        openEdit(expense);
        // Seed on-the-way costs from whatever is already saved on this batch
        const existing = (expense.batch as any)?.purchasingCosts ?? [];
        if (existing.length > 0) {
          setOnWayExpenses(
            existing.map((c: any) => ({
              tempId:      crypto.randomUUID(),
              category:    c.category    ?? '',
              description: c.description ?? '',
              amount:      c.amount?.toString() ?? '',
            }))
          );
        }
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load expense.'))
      .finally(() => setPageLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const handleCancel = () => { closeForm(); navigate('/admin/expenses'); };

  const handleSubmitAndRedirect = async () => {
    const validOnWay: AdditionalExpense[] = onWayExpenses
      .filter(r => r.category && r.amount)
      .map(r => ({
        category:    r.category,
        description: r.description || null,
        amount:      parseFloat(r.amount),
      }));

    const ok = await handleSubmit(validOnWay);
    if (ok) navigate('/admin/expenses');
  };

  if (pageLoading) return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}><Spin size="large" /></div>
  );

  if (loadError) return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ErrorBanner message={loadError} />
      <Button variant="secondary" onClick={() => navigate('/admin/expenses')}>Back to Expenses</Button>
    </div>
  );

  return (
    <ExpenseFormPage
      editing={editing}
      form={form}
      products={products}
      batches={batches}
      loading={saving}
      error={error}
      success={success}
      onWayExpenses={onWayExpenses}
      onChange={setField}
      onModeChange={onModeChange}
      onBatchProductChange={setBatchProductField}
      onAddBatchProduct={addBatchProduct}
      onRemoveBatchProduct={removeBatchProduct}
      onAddOnWay={addOnWay}
      onRemoveOnWay={removeOnWay}
      onOnWayChange={changeOnWay}
      onSubmit={handleSubmitAndRedirect}
      onCancel={handleCancel}
      onDismissError={() => setError('')}
      onDismissSuccess={() => setSuccess('')}
    />
  );
};

export default ExpenseFormRoute;