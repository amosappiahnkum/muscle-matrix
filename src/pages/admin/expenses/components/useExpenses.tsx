import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteExpense, getBatches, getExpenses, getProducts, saveExpense, updateExpense } from '@/api/api';
import { Expense, ExpenseBatch, ExpensePayload, Product } from '@/types';

export type ExpenseMode = 'custom' | 'inventory_batch';

export interface ExpenseFormData {
  mode:        ExpenseMode;
  batchId:     string;
  batchName:   string;
  productId:   string;
  quantity:    string;
  unitCost:    string;
  expiryDate:  string;
  supplier:    string;
  description: string;
  amount:      string;
  category:    string;
  note:        string;
}

export const defaultForm: ExpenseFormData = {
  mode: 'custom',
  batchId: '',
  batchName: '',
  productId: '',
  quantity: '',
  unitCost: '',
  expiryDate: '',
  supplier: '',
  description: '',
  amount: '',
  category: '',
  note: '',
};

const buildPayload = (form: ExpenseFormData): ExpensePayload => {
  const description = form.description.trim();
  const category    = form.category.trim() || null;
  const note        = form.note.trim()     || null;

  if (!description) throw new Error('Description is required.');

  if (form.mode === 'custom') {
    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0)
      throw new Error('Amount must be greater than 0.');
    return { description, amount, category, note };
  }

  if (form.batchId) {
    const amount = form.amount ? Number(form.amount) : undefined;
    if (amount !== undefined && (Number.isNaN(amount) || amount <= 0)) {
      throw new Error('Amount must be greater than 0.');
    }

    return {
      batchId: form.batchId,
      description,
      amount,
      category,
      note,
    };
  }

  const quantity = Number.parseInt(form.quantity, 10);
  const unitCost = Number(form.unitCost);

  if (!form.productId)                                      throw new Error('Select a product for this batch.');
  if (!form.quantity || Number.isNaN(quantity) || quantity < 1) throw new Error('Quantity must be at least 1.');
  if (!form.unitCost || Number.isNaN(unitCost) || unitCost < 0) throw new Error('Unit cost must be 0 or more.');

  return {
    createBatch: true,
    batchName:   form.batchName.trim() || null,
    productId:   form.productId,
    quantity,
    unitCost,
    expiryDate:  form.expiryDate || null,
    supplier:    form.supplier.trim() || null,
    description,
    category,
    note,
  };
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [batches,  setBatches]  = useState<ExpenseBatch[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [search,   setSearch]   = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ExpenseMode>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing,  setEditing]  = useState<Expense | null>(null);
  const [form,     setForm]     = useState<ExpenseFormData>(defaultForm);

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

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setError('');
    setFormOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setForm({
      mode:        expense.type,
      batchId:     expense.batchId ?? '',
      batchName:   expense.batch?.name ?? '',
      productId:   expense.productId ?? expense.batch?.productId ?? '',
      quantity:    expense.batch?.quantity?.toString() ?? '',
      unitCost:    expense.batch?.unitCost?.toString() ?? '',
      expiryDate:  expense.batch?.expiryDate ?? '',
      supplier:    expense.batch?.supplier ?? '',
      description: expense.description,
      amount:      expense.amount.toString(),
      category:    expense.category ?? '',
      note:        expense.note ?? '',
    });
    setError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(defaultForm);
  };

  const setField =
    (key: keyof ExpenseFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(cur => ({ ...cur, [key]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload(form);

      if (editing) {
        const updated = await updateExpense(editing.id, {
          description: payload.description,
          amount:      payload.amount,
          category:    payload.category,
          note:        payload.note,
        });
        setExpenses(cur => cur.map(e => e.id === updated.id ? updated : e));
        flash('Expense updated successfully.');
      } else {
        const created = await saveExpense(payload);
        setExpenses(cur => [created, ...cur]);
        flash('Expense added successfully.');
      }

      closeForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save expense.');
    } finally {
      setSaving(false);
    }
  };

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
    onModeChange: (mode: ExpenseMode) => setForm(cur => ({ ...cur, mode })),
    // actions
    openCreate, openEdit, closeForm, handleSubmit, handleDelete,
  };
}
