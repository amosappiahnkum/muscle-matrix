
import {
  User,
  Product,
  Transaction,
  DailySalesReport,
  UserRole,
} from '@/types';

// ─── Config ──────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// Token is stored in memory + localStorage
let _token: string | null = localStorage.getItem('mm_token');

export const getToken = (): string | null => _token;

export const setToken = (token: string | null): void => {
  _token = token;
  if (token) {
    localStorage.setItem('mm_token', token);
  } else {
    localStorage.removeItem('mm_token');
  }
};

// ─── HTTP helper ─────────────────────────────────────────────────────────────
async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? 'Request failed');
  }

  // 204 No Content — return empty
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

const get  = <T>(path: string)                                 => request<T>('GET',    path);
const post = <T>(path: string, body: Record<string, unknown>)  => request<T>('POST',   path, body);
const put  = <T>(path: string, body: Record<string, unknown>)  => request<T>('PUT',    path, body);
const del  = <T>(path: string)                                 => request<T>('DELETE', path);


// ─── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * Replaces: authenticateUser(username, password)
 * Returns the User on success, null on failure
 */
export const authenticateUser = async (
  username: string,
  password: string
): Promise<User | null> => {
  try {
    const data = await post<{ token: string; user: User }>('/login', {
      username,
      password,
    });
    setToken(data.token);
    return data.user;
  } catch {
    return null;
  }
};

/**
 * Call on app load to restore session from saved token
 */
export const restoreSession = async (): Promise<User | null> => {
  if (!_token) return null;
  try {
    return await get<User>('/me');
  } catch {
    setToken(null);
    return null;
  }
};

/**
 * Replaces: clearing auth state on logout
 */
export const logout = async (): Promise<void> => {
  try {
    await post('/logout', {});
  } finally {
    setToken(null);
  }
};


// ─── USERS ───────────────────────────────────────────────────────────────────

/** Replaces: getUsers() */
export const getUsers = (): Promise<User[]> =>
  get<User[]>('/users');

/** Replaces: getUsersByRole(role) */
export const getUsersByRole = (role: UserRole): Promise<User[]> =>
  get<User[]>(`/users?role=${role}`);

/** Replaces: saveUser(user) — handles both create and update */
export const saveUser = async (user: Partial<User> & { password?: string }): Promise<User> => {
  if (user.id) {
    return put<User>(`/users/${user.id}`, user as Record<string, unknown>);
  }
  return post<User>('/users', user as Record<string, unknown>);
};

/** Replaces: deleteUser(userId) */
export const deleteUser = (userId: string): Promise<void> =>
  del(`/users/${userId}`);

/** Replaces: resetAdminCredentials() — now works for any user */
export const resetUserPassword = (userId: string, password: string): Promise<void> =>
  post(`/users/${userId}/reset-password`, { password });


// ─── PRODUCTS ────────────────────────────────────────────────────────────────

/** Replaces: getProducts() */
export const getProducts = (): Promise<Product[]> =>
  get<Product[]>('/products');

/** Replaces: searchProducts(query) */
export const searchProducts = (query: string): Promise<Product[]> =>
  get<Product[]>(`/products?search=${encodeURIComponent(query)}`);

/** Replaces: getProductById(productId) */
export const getProductById = (productId: string): Promise<Product> =>
  get<Product>(`/products/${productId}`);

/** Replaces: saveProduct(product) — handles both create and update */
export const saveProduct = async (product: Partial<Product>): Promise<Product> => {
  if (product.id) {
    return put<Product>(`/products/${product.id}`, product as Record<string, unknown>);
  }
  return post<Product>('/products', product as Record<string, unknown>);
};

/** Replaces: deleteProduct(productId) */
export const deleteProduct = (productId: string): Promise<void> =>
  del(`/products/${productId}`);

/** Replaces: getLowStockProducts(threshold) */
export const getLowStockProducts = (threshold = 10): Promise<Product[]> =>
  get<Product[]>(`/products/low-stock?threshold=${threshold}`);

/**
 * NOTE: updateProductQuantity() no longer exists as a standalone call.
 * Stock is automatically deducted when you call saveTransaction().
 * The backend handles it atomically.
 */


// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

/** Replaces: getTransactions() */
export const getTransactions = (): Promise<Transaction[]> =>
  get<Transaction[]>('/transactions');

/** Replaces: getTransactionsByDate(date) */
export const getTransactionsByDate = (date: string): Promise<Transaction[]> =>
  get<Transaction[]>(`/transactions?date=${date}`);

/** Replaces: getTransactionsByType(type) */
export const getTransactionsByType = (
  type: 'wholesale' | 'retail'
): Promise<Transaction[]> =>
  get<Transaction[]>(`/transactions?type=${type}`);

/**
 * Replaces: saveTransaction(transaction) + updateProductQuantity()
 * Stock deduction now happens automatically on the backend.
 */
export const saveTransaction = (
  transaction: Omit<Transaction, 'id' | 'receiptNumber' | 'employeeId' | 'employeeName'>
): Promise<Transaction> =>
  post<Transaction>('/transactions', transaction as unknown as Record<string, unknown>);

/**
 * NOTE: generateReceiptNumber() is now handled by the backend.
 * You no longer need to call it from the frontend.
 */


// ─── REPORTS ─────────────────────────────────────────────────────────────────

/** Replaces: getDailySalesReport(date) */
export const getDailySalesReport = (date: string): Promise<DailySalesReport> =>
  get<DailySalesReport>(`/reports/daily?date=${date}`);

/** New: get report for a date range */
export const getRangeReport = (
  from: string,
  to: string
): Promise<DailySalesReport[]> =>
  get<DailySalesReport[]>(`/reports/range?from=${from}&to=${to}`);

/** Replaces: exportDatabase() */
export const exportDatabase = async (): Promise<string> => {
  const data = await get<Record<string, unknown>>('/reports/export');
  return JSON.stringify(data, null, 2);
};

/**
 * importDatabase() — NOT implemented as an API endpoint.
 * Restoring data should be done directly on the server via psql.
 * If you need a UI import, ask and I can add an admin-layouts import endpoint.
 */
