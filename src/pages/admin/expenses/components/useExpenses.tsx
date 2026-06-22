import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteExpense, getBatches, getExpenses, getProducts, saveExpense, updateExpense } from '@/api/api';
import { Expense, ExpenseBatch, ExpensePayload, Product } from '@/types';

export type ExpenseMode = 'custom' | 'inventory_batch';

export interface BatchProductEntry {
  productId: string;
  quantity:  string;
  unitCost:  string;
}

// On-the-way purchasing costs (transport, loading, etc.)
export interface AdditionalExpense {
  category:    string;
  description: string | null;
  amount:      number;
}

export interface ExpenseFormData {
  mode:          ExpenseMode;
  batchId:       string;
  batchName:     string;
  batchProducts: BatchProductEntry[];
  supplier:      string;
  description:   string;
  amount:        string;
  category:      string;
  note:          string;
  
}

export const emptyBatchProduct = (): BatchProductEntry => ({
  productId: '',
  quantity:  '',
  unitCost:  '',
});

export const defaultForm: ExpenseFormData = {
  mode:          'custom',
  batchId:       '',
  batchName:     '',
  batchProducts: [emptyBatchProduct()],
  supplier:      '',
  description:   '',
  amount:        '',
  category:      '',
  note:          '',
};

// ─── payload builder ──────────────────────────────────────────────────────────

const buildPayload = (
  form:                 ExpenseFormData,
  additionalExpenses?:  AdditionalExpense[],
): ExpensePayload => {
  // Description is optional — use null when blank
  const description = form.description.trim() || null;
  const category    = form.category.trim()    || null;
  const note        = form.note.trim()        || null;

  // ── custom expense ────────────────────────────────────────────────────────
  if (form.mode === 'custom') {
    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0)
      throw new Error('Amount must be greater than 0.');
    return { description: description ?? 'Custom expense', amount, category, note };
  }

  // ── link to existing batch ────────────────────────────────────────────────
  if (form.batchId) {
    const amount = form.amount ? Number(form.amount) : undefined;
    if (amount !== undefined && (Number.isNaN(amount) || amount <= 0))
      throw new Error('Amount must be greater than 0.');

    const products = form.batchProducts
      .filter(p => p.productId || p.quantity || p.unitCost)
      .map((p, i) => {
        const qty  = Number.parseInt(p.quantity, 10);
        const cost = Number(p.unitCost);
        if (!p.productId)                                    throw new Error(`Row ${i + 1}: select a product.`);
        if (!p.quantity || Number.isNaN(qty) || qty < 1)    throw new Error(`Row ${i + 1}: quantity must be ≥ 1.`);
        if (!p.unitCost || Number.isNaN(cost) || cost < 0)  throw new Error(`Row ${i + 1}: unit cost must be ≥ 0.`);
        return { productId: p.productId, quantity: qty, unitCost: cost };
      });

    return {
      batchId: form.batchId,
      description: description ?? 'Inventory batch expense',
      amount,
      category,
      note,
      ...(products.length > 0 && { products }),
    };
  }

  // ── create new batch with multiple products ───────────────────────────────
  if (form.batchProducts.length === 0)
    throw new Error('Add at least one product to the batch.');

  const products = form.batchProducts.map((p, i) => {
    const qty  = Number.parseInt(p.quantity, 10);
    const cost = Number(p.unitCost);
    if (!p.productId)                                    throw new Error(`Row ${i + 1}: select a product.`);
    if (!p.quantity || Number.isNaN(qty) || qty < 1)    throw new Error(`Row ${i + 1}: quantity must be ≥ 1.`);
    if (!p.unitCost || Number.isNaN(cost) || cost < 0)  throw new Error(`Row ${i + 1}: unit cost must be ≥ 0.`);
    return { productId: p.productId, quantity: qty, unitCost: cost };
  });

  // Filter out incomplete on-the-way rows just in case
  const validAdditional = (additionalExpenses ?? []).filter(
    e => e.category && e.amount > 0
  );

  return {
    createBatch:  true,
    products,
    supplier:     form.supplier.trim() || null,
    description:  description ?? 'Inventory batch expense',
    category,
    note,
    // Only include if there are valid rows — backend ignores missing key
    ...(validAdditional.length > 0 && { additionalExpenses: validAdditional }),
  } as ExpensePayload;
};

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useExpenses() {
  const [expenses,   setExpenses]   = useState<Expense[]>([]);
  const [products,   setProducts]   = useState<Product[]>([]);
  const [batches,    setBatches]    = useState<ExpenseBatch[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ExpenseMode>('all');
  const [formOpen,   setFormOpen]   = useState(false);
  const [editing,    setEditing]    = useState<Expense | null>(null);
  const [form,       setForm]       = useState<ExpenseFormData>(defaultForm);

  const flash = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [expenseRows, productRows, batchRows] = await Promise.all([
        getExpenses(),
        getProducts(),
        getBatches(),
      ]);
      setExpenses(expenseRows);
      setProducts(productRows);
      setBatches(batchRows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => {
    const custom = expenses.filter(e => e.type === 'custom').reduce((s, e) => s + e.amount, 0);
    const batch  = expenses.filter(e => e.type === 'inventory_batch').reduce((s, e) => s + e.amount, 0);
    return { custom, batch, total: custom + batch };
  }, [expenses]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      if (typeFilter !== 'all' && expense.type !== typeFilter) return false;
      if (!query) return true;
      return [expense.description, expense.category, expense.note, expense.productName, expense.batch?.supplier]
        .some(v => v?.toLowerCase().includes(query));
    });
  }, [expenses, search, typeFilter]);

  // ── open/close ────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setError('');
    setFormOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);

    const batchProducts: BatchProductEntry[] =
      expense.batch?.products?.map(p => ({
        productId: p.productId ?? '',
        quantity:  p.quantity?.toString() ?? '',
        unitCost:  p.unitCost?.toString() ?? '',
      })) ??
      (expense.batch
        ? [{
            productId: expense.productId ?? expense.batch.productId ?? '',
            quantity:  expense.batch.quantity?.toString() ?? '',
            unitCost:  expense.batch.unitCost?.toString() ?? '',
          }]
        : [emptyBatchProduct()]);

    setForm({
      mode:          expense.type,
      batchId:       expense.batchId ?? '',
      batchName:     expense.batch?.name ?? '',
      batchProducts,
      supplier:      expense.batch?.supplier ?? '',
      description:   expense.description ?? '',
      amount:        expense.amount.toString(),
      category:      expense.category ?? '',
      note:          expense.note ?? '',
    });
    setError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(defaultForm);
  };

  // ── field helpers ─────────────────────────────────────────────────────────

  const setField =
    (key: keyof ExpenseFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(cur => ({ ...cur, [key]: e.target.value }));

  const setBatchProductField = (
    index: number,
    field: keyof BatchProductEntry,
    value: string,
  ) =>
    setForm(cur => {
      const updated = cur.batchProducts.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      );
      return { ...cur, batchProducts: updated };
    });

  const addBatchProduct = () =>
    setForm(cur => ({
      ...cur,
      batchProducts: [...cur.batchProducts, emptyBatchProduct()],
    }));

  const removeBatchProduct = (index: number) =>
    setForm(cur => ({
      ...cur,
      batchProducts: cur.batchProducts.filter((_, i) => i !== index),
    }));

  // ── submit ────────────────────────────────────────────────────────────────

  /**
   * Pass `additionalExpenses` from the form's on-the-way costs section.
   * Only relevant when creating a new batch — ignored for custom or edit.
   */
  const handleSubmit = async (
    additionalExpenses?: AdditionalExpense[],
  ): Promise<boolean> => {
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload(form, additionalExpenses);

      if (editing) {
        const updated = await updateExpense(editing.id, {
          description: payload.description,
          amount:      payload.amount,
          category:    payload.category,
          note:        payload.note,
          ...('products' in payload && { products: payload.products }),
          // Always send additionalExpenses on update so the backend can sync
          // them — send empty array to clear all on-the-way costs if user removed them all
          additionalExpenses: (additionalExpenses ?? []).filter(e => e.category && e.amount > 0),
        });
        setExpenses(cur => cur.map(e => e.id === updated.id ? updated : e));
        flash('Expense updated successfully.');
      } else {
        const created = await saveExpense(payload);
        setExpenses(cur => [created, ...cur]);
        flash('Expense added successfully.');
      }

      closeForm();
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save expense.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Delete expense "${expense.description}"?`)) return;
    setError('');
    try {
      await deleteExpense(expense.id);
      setExpenses(cur => cur.filter(e => e.id !== expense.id));
      flash('Expense deleted successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense.');
    }
  };

  return {
    // data
    expenses, products, batches, filtered, totals,
    // ui state
    loading, saving, error, success, search, typeFilter, formOpen, editing, form,
    // setters
    setSearch, setTypeFilter, setError, setSuccess, setField,
    setBatchProductField, addBatchProduct, removeBatchProduct,
    onModeChange: (mode: ExpenseMode) => setForm(cur => ({ ...cur, mode })),
    // actions
    openCreate, openEdit, closeForm, handleSubmit, handleDelete,
  };
}