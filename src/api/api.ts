import {
  User, Product, Transaction,
  DailySalesReport, UserRole,
} from '../types';

// ─── Config ───────────────────────────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000';
const BASE_URL    = import.meta.env.VITE_API_URL     ?? `${BACKEND_URL}/api`;

// ─── CSRF Helper ──────────────────────────────────────────────────────────────

function getXsrfToken(): string {
  const match = document.cookie.match(/(^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : '';
}

async function fetchCsrfCookie(): Promise<void> {
  await fetch(`${BACKEND_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

// ─── Core Request ─────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Attach XSRF token for all state-changing requests
  const xsrfToken = getXsrfToken();
  if (xsrfToken) {
    headers['X-XSRF-TOKEN'] = xsrfToken;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    throw new Error('Not authenticated');
  }

  if (res.status === 419) {
    throw new Error('CSRF token mismatch — please refresh and try again');
  }

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

const get  = <T>(path: string)                                 => request<T>('GET',    path);
const post = <T>(path: string, body: Record<string, unknown>)  => request<T>('POST',   path, body);
const put  = <T>(path: string, body: Record<string, unknown>)  => request<T>('PUT',    path, body);
const del  = <T>(path: string)                                 => request<T>('DELETE', path);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authenticateUser = async (
  username: string,
  password: string,
): Promise<User> => {
  await fetchCsrfCookie();
  const data = await post<{ user: User }>('/login', { username, password });
  return data.user;
};

export const restoreSession = async (): Promise<User | null> => {
  try {
    return await get<User>('/me');
  } catch {
    return null;
  }
};

export const logout = async (): Promise<void> => {
  await post('/logout', {});
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUsers = (): Promise<User[]> =>
  get<User[]>('/users');

export const getUsersByRole = (role: UserRole): Promise<User[]> =>
  get<User[]>(`/users?role=${role}`);

export const saveUser = async (
  user: Partial<User> & { password?: string },
): Promise<User> => {
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

export const saveProduct = async (product: Partial<Product>): Promise<Product> => {
  if (product.id) return put<Product>(`/products/${product.id}`, product as Record<string, unknown>);
  return post<Product>('/products', product as Record<string, unknown>);
};

export const deleteProduct = (productId: string): Promise<void> =>
  del(`/products/${productId}`);

export const getLowStockProducts = (threshold = 10): Promise<Product[]> =>
  get<Product[]>(`/products/low-stock?threshold=${threshold}`);

// ─── Transactions ─────────────────────────────────────────────────────────────

export const getTransactions = (): Promise<Transaction[]> =>
  get<Transaction[]>('/transactions');

export const getTransactionsByDate = (date: string): Promise<Transaction[]> =>
  get<Transaction[]>(`/transactions?date=${date}`);

export const getTransactionsByType = (
  type: 'wholesale' | 'retail',
): Promise<Transaction[]> =>
  get<Transaction[]>(`/transactions?type=${type}`);

export const saveTransaction = (
  transaction: Omit<Transaction, 'id' | 'receiptNumber' | 'employeeId' | 'employeeName'>,
): Promise<Transaction> =>
  post<Transaction>('/transactions', transaction as unknown as Record<string, unknown>);

// ─── Reports ──────────────────────────────────────────────────────────────────

export const getDailySalesReport = (date: string): Promise<DailySalesReport> =>
  get<DailySalesReport>(`/reports/daily?date=${date}`);

export const getRangeReport = (from: string, to: string): Promise<DailySalesReport[]> =>
  get<DailySalesReport[]>(`/reports/range?from=${from}&to=${to}`);

export const exportDatabase = async (): Promise<string> => {
  const data = await get<Record<string, unknown>>('/reports/export');
  return JSON.stringify(data, null, 2);
};