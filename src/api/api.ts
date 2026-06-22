import {
  User, Product, InventoryEntry, Transaction,
  DailySalesReport, UserRole, TransactionPayload,
  Expense, ExpenseBatch, ExpensePayload,
  BatchProductPayload,
  ProductPayload,
} from '../types';

// ─── Config ───────────────────────────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000';
const BASE_URL    = import.meta.env.VITE_API_URL     ?? `${BACKEND_URL}/api`;

// ─── CSRF ─────────────────────────────────────────────────────────────────────

function getXsrfToken(): string {
  const match = document.cookie.match(/(^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : '';
}

async function fetchCsrfCookie(): Promise<void> {
  await fetch(`${BACKEND_URL}/sanctum/csrf-cookie`, { credentials: 'include' });
}

// ─── Core Request ─────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path:   string,
  body?:  Record<string, unknown>,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  };

  const xsrf = getXsrfToken();
  if (xsrf) headers['X-XSRF-TOKEN'] = xsrf;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) throw new Error('Not authenticated');
  if (res.status === 419) throw new Error('CSRF token mismatch — please refresh and try again');
  if (res.status === 429) throw new Error('Too many attempts. Please wait a minute and try again.');

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (json?.errors) {
      const first = Object.values(json.errors)[0];
      throw new Error(Array.isArray(first) ? first[0] : String(first));
    }
    throw new Error(json?.message ?? `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

const get  = <T>(path: string)                                => request<T>('GET',    path);
const post = <T>(path: string, body: Record<string, unknown>) => request<T>('POST',   path, body);
const put  = <T>(path: string, body: Record<string, unknown>) => request<T>('PUT',    path, body);
const del  = <T>(path: string)                                => request<T>('DELETE', path);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authenticateUser = async (
  username:     string,
  password:     string,
  expectedRole?: UserRole,
): Promise<User> => {
  await fetchCsrfCookie();
  const data = await post<{ user: User }>('/login', {
    username,
    password,
    ...(expectedRole ? { role: expectedRole } : {}),
  });
  return data.user;
};

export const restoreSession = async (): Promise<User | null> => {
  try { return await get<User>('/me'); }
  catch { return null; }
};

export const logout = (): Promise<void> =>
  post('/logout', {});

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUsers = (): Promise<User[]> =>
  get<User[]>('/users');

export const getUsersByRole = (role: UserRole): Promise<User[]> =>
  get<User[]>(`/users?role=${role}`);

export const saveUser = (user: Partial<User> & { password?: string }): Promise<User> => {
  if (user.id) return put<User>(`/users/${user.id}`, user as Record<string, unknown>);
  return post<User>('/users', user as Record<string, unknown>);
};

export const deleteUser = (userId: string): Promise<void> =>
  del(`/users/${userId}`);

export const resetUserPassword = (userId: string, password: string): Promise<void> =>
  post(`/users/${userId}/reset-password`, { password });

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = (): Promise<Product[]> =>
  get<Product[]>('/products');

export const searchProducts = (query: string): Promise<Product[]> =>
  get<Product[]>(`/products?search=${encodeURIComponent(query)}`);

export const getProductById = (productId: string): Promise<Product> =>
  get<Product>(`/products/${productId}`);

export const getLowStockProducts = (threshold = 10): Promise<Product[]> =>
  get<Product[]>(`/products/low-stock?threshold=${threshold}`);

export const saveProduct = (product: Partial<Product>): Promise<Product> => {
  if (product.id) return put<Product>(`/products/${product.id}`, product as Record<string, unknown>);
  return post<Product>('/products', product as Record<string, unknown>);
};

export const deleteProduct = (productId: string): Promise<void> =>
  del(`/products/${productId}`);

// ─── Inventory ────────────────────────────────────────────────────────────────

export const getProduct = (id: string): Promise<Product> =>
  get(`/products/${id}`);

export const updateProduct = (id: string, data: Partial<ProductPayload>): Promise<Product> =>
  put(`/products/${id}`, data as unknown as Record<string, unknown>);

export interface BatchUpdatePayload {
  name?:       string | null;
  supplier?:   string | null;
  expiryDate?: string | null;
  note?:       string | null;
  products?:   { productId: string; quantity: number; unitCost: number }[];
}

export interface RestockLine {
  productId:    string;
  quantity:     number;
  unitCost?:    number;
  expiry_date?: string;
}

export interface RestockMultiplePayload {
  products:          RestockLine[];
  note?:             string;
  expiry_date?:      string;
  createBatch?:      boolean;
  batchDescription?: string;
  existingBatchId?:  string;
  supplier?:         string;
}

export const restockMultiple = (payload: RestockMultiplePayload): Promise<any[]> =>
  post('/inventory/restock-multiple', payload as unknown as Record<string, unknown>);

export const getInventoryLog = (productId?: string): Promise<InventoryEntry[]> =>
  get<InventoryEntry[]>(productId
    ? `/inventory?productId=${encodeURIComponent(productId)}`
    : '/inventory'
  );

export const getBatch = (id: string): Promise<any> =>
  get(`/batches/${id}`);

export const getInventoryStock = (): Promise<{ productId: string; productName: string; quantity: number }[]> =>
  get('/inventory/stock');

export const addStock = (payload: {
  productId:    string;
  quantity:     number;
  note?:        string;
  expiry_date?: string;
  createBatch?: boolean;
  batchName?:   string;
  unitCost?:    number;
  supplier?:    string;
}): Promise<InventoryEntry> =>
  post<InventoryEntry>('/inventory/restock', payload as Record<string, unknown>);

export const adjustStock = (payload: {
  productId: string;
  quantity:  number;
  note?:     string;
}): Promise<InventoryEntry> =>
  post<InventoryEntry>('/inventory/adjust', payload as Record<string, unknown>);

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const getExpense = (id: string): Promise<Expense> =>
  get(`/expenses/${id}`);

export const getExpenses = (): Promise<Expense[]> =>
  get<Expense[]>('/expenses');

export const getTodayExpenses = (): Promise<Expense[]> =>
  get<Expense[]>('/expenses?today=1');

export const saveExpense = (expense: ExpensePayload): Promise<Expense> =>
  post<Expense>('/expenses', expense as unknown as Record<string, unknown>);

export const updateExpense = (id: string, expense: Partial<ExpensePayload>): Promise<Expense> =>
  put<Expense>(`/expenses/${id}`, expense as Record<string, unknown>);

export const deleteExpense = (id: string): Promise<void> =>
  del(`/expenses/${id}`);

// ─── Batches ──────────────────────────────────────────────────────────────────

export const getBatches = (productId?: string): Promise<ExpenseBatch[]> =>
  get<ExpenseBatch[]>(productId
    ? `/batches?productId=${encodeURIComponent(productId)}`
    : '/batches'
  );

export const updateBatch = (
  id: string,
  data: {
    products?:   BatchProductPayload[];
    name?:       string | null;
    supplier?:   string | null;
    expiryDate?: string | null;
    note?:       string | null;
  },
): Promise<ExpenseBatch> =>
  put<ExpenseBatch>(`/batches/${id}`, data as Record<string, unknown>);

// ─── Transactions ─────────────────────────────────────────────────────────────

export const getTransactions = (): Promise<Transaction[]> =>
  get<Transaction[]>('/transactions');

export const getTransactionsByDate = (date: string): Promise<Transaction[]> =>
  get<Transaction[]>(`/transactions?date=${date}`);

export const getTransactionsByType = (type: 'wholesale' | 'retail'): Promise<Transaction[]> =>
  get<Transaction[]>(`/transactions?type=${type}`);

export const getTransactionById = (id: string): Promise<Transaction> =>
  get<Transaction>(`/transactions/${id}`);

export const saveTransaction = (transaction: TransactionPayload): Promise<Transaction> =>
  post<Transaction>('/transactions', transaction as unknown as Record<string, unknown>);

export const deleteTransaction = (id: string): Promise<void> =>
  del(`/transactions/${id}`);

// ─── Reports ──────────────────────────────────────────────────────────────────

export const getDailySalesReport = (date: string): Promise<DailySalesReport> =>
  get<DailySalesReport>(`/reports/daily?date=${date}`);

export const getRangeReport = (from: string, to: string): Promise<DailySalesReport[]> =>
  get<DailySalesReport[]>(`/reports/range?from=${from}&to=${to}`);

export const exportDatabase = async (): Promise<string> => {
  const data = await get<Record<string, unknown>>('/reports/export');
  return JSON.stringify(data, null, 2);
};

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id:          number;
  name:        string;
  description: string | null;
  createdBy:   string | null;
  createdAt:   string | null;
  updatedAt:   string | null;
}

export interface CategoryPayload {
  name:         string;
  description?: string | null;
}

export const getCategories = (): Promise<Category[]> =>
  get<Category[]>('/categories');

export const searchCategories = (query: string): Promise<Category[]> =>
  get<Category[]>(`/categories?search=${encodeURIComponent(query)}`);

export const getCategoryById = (id: number): Promise<Category> =>
  get<Category>(`/categories/${id}`);

export const saveCategory = (category: Partial<CategoryPayload> & { id?: number }): Promise<Category> => {
  if (category.id) return put<Category>(`/categories/${category.id}`, category as Record<string, unknown>);
  return post<Category>('/categories', category as Record<string, unknown>);
};

export const deleteCategory = (id: number): Promise<void> =>
  del(`/categories/${id}`);

// ─── Suppliers ────────────────────────────────────────────────────────────────

export interface Supplier {
  id:            number;
  name:          string;
  contactPerson: string | null;
  phone:         string | null;
  email:         string | null;
  address:       string | null;
  note:          string | null;
  createdBy:     string | null;
  createdAt:     string | null;
  updatedAt:     string | null;
}

export interface SupplierPayload {
  name:           string;
  contactPerson?: string | null;
  phone?:         string | null;
  email?:         string | null;
  address?:       string | null;
  note?:          string | null;
}

export const getSuppliers = (): Promise<Supplier[]> =>
  get<Supplier[]>('/suppliers');

export const searchSuppliers = (query: string): Promise<Supplier[]> =>
  get<Supplier[]>(`/suppliers?search=${encodeURIComponent(query)}`);

export const getSupplierById = (id: number): Promise<Supplier> =>
  get<Supplier>(`/suppliers/${id}`);

export const saveSupplier = (supplier: Partial<SupplierPayload> & { id?: number }): Promise<Supplier> => {
  if (supplier.id) return put<Supplier>(`/suppliers/${supplier.id}`, supplier as Record<string, unknown>);
  return post<Supplier>('/suppliers', supplier as Record<string, unknown>);
};

export const deleteSupplier = (id: number): Promise<void> =>
  del(`/suppliers/${id}`);