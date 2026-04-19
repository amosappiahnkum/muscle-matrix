import {
  User, Product, Transaction,
  DailySalesReport, UserRole, LoginResponse,
} from '../types';

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL    = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const COOKIE_NAME = 'mm_token';
const COOKIE_DAYS = 1;

// ─── Cookie helpers ───────────────────────────────────────────────────────────
const setCookie = (name: string, value: string, days: number): void => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `expires=${expires}`,
    'path=/',
    'SameSite=Strict',
    ...(window.location.protocol === 'https:' ? ['Secure'] : []),
  ].join('; ');
};

const getCookie = (name: string): string | null => {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
};

const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
};

// ─── Token management ─────────────────────────────────────────────────────────
let _token: string | null = getCookie(COOKIE_NAME);

export const getToken = (): string | null => _token;

export const setToken = (token: string | null): void => {
  _token = token;
  if (token) {
    setCookie(COOKIE_NAME, token, COOKIE_DAYS);
  } else {
    deleteCookie(COOKIE_NAME);
  }
};

// ─── HTTP helper ──────────────────────────────────────────────────────────────
async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = getCookie(COOKIE_NAME);
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  // Token expired or invalid
  if (res.status === 401) {
    setToken(null);
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    // Parse Laravel validation errors and real messages
    const json = await res.json().catch(() => null);

    // Laravel validation errors come back as { errors: { field: ['msg'] } }
    if (json?.errors) {
      const first = Object.values(json.errors as Record<string, string[]>)[0];
      throw new Error(Array.isArray(first) ? first[0] : String(first));
    }

    // Laravel throws { message: '...' } for other errors
    throw new Error(json?.message ?? `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const get  = <T>(path: string)                                => request<T>('GET',    path);
const post = <T>(path: string, body: Record<string, unknown>) => request<T>('POST',   path, body);
const put  = <T>(path: string, body: Record<string, unknown>) => request<T>('PUT',    path, body);
const del  = <T>(path: string)                                => request<T>('DELETE', path);

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// Throws on wrong credentials so AuthContext can show the real error message.
// Previously this caught all errors and returned null, hiding "Invalid credentials".
export const authenticateUser = async (
  username: string,
  password: string,
): Promise<User> => {
  const data = await post<LoginResponse>('/login', { username, password });
  setToken(data.token);
  return data.user;
};

export const restoreSession = async (): Promise<User | null> => {
  if (!getCookie(COOKIE_NAME)) return null;
  try {
    return await get<User>('/me');
  } catch {
    setToken(null);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await post('/logout', {});
  } finally {
    setToken(null);
  }
};

// ─── USERS ────────────────────────────────────────────────────────────────────

export const getUsers = (): Promise<User[]> =>
  get<User[]>('/users');

export const getUsersByRole = (role: UserRole): Promise<User[]> =>
  get<User[]>(`/users?role=${role}`);

export const saveUser = async (user: Partial<User> & { password?: string }): Promise<User> => {
  if (user.id) return put<User>(`/users/${user.id}`, user as Record<string, unknown>);
  return post<User>('/users', user as Record<string, unknown>);
};

export const deleteUser = (userId: string): Promise<void> =>
  del(`/users/${userId}`);

export const resetUserPassword = (userId: string, password: string): Promise<void> =>
  post(`/users/${userId}/reset-password`, { password });

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

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

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

export const getTransactions = (): Promise<Transaction[]> =>
  get<Transaction[]>('/transactions');

export const getTransactionsByDate = (date: string): Promise<Transaction[]> =>
  get<Transaction[]>(`/transactions?date=${date}`);

export const getTransactionsByType = (type: 'wholesale' | 'retail'): Promise<Transaction[]> =>
  get<Transaction[]>(`/transactions?type=${type}`);

export const saveTransaction = (
  transaction: Omit<Transaction, 'id' | 'receiptNumber' | 'employeeId' | 'employeeName'>,
): Promise<Transaction> =>
  post<Transaction>('/transactions', transaction as unknown as Record<string, unknown>);

// ─── REPORTS ──────────────────────────────────────────────────────────────────

export const getDailySalesReport = (date: string): Promise<DailySalesReport> =>
  get<DailySalesReport>(`/reports/daily?date=${date}`);

export const getRangeReport = (from: string, to: string): Promise<DailySalesReport[]> =>
  get<DailySalesReport[]>(`/reports/range?from=${from}&to=${to}`);

export const exportDatabase = async (): Promise<string> => {
  const data = await get<Record<string, unknown>>('/reports/export');
  return JSON.stringify(data, null, 2);
};