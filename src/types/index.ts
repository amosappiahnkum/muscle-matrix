export type UserRole = 'admin' | 'wholesale' | 'retail';


export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}


export interface UserPayload {
  username: string;
  password: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  wholesalePrice: number;
  retailPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  quantity: number;
  wholesalePrice: number;
  retailPrice: number;
}

// ─── Sale Item ───────────────────────────────────────────────────────────────
// Matches transaction_items table — part of a Transaction
export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

// ─── Transaction ─────────────────────────────────────────────────────────────
// employeeId and employeeName are set by the backend from the auth token —
// you no longer need to pass them when creating a transaction.
// signatures can be null if not captured.
export interface Transaction {
  id: string;
  receiptNumber: string;
  type: 'wholesale' | 'retail';
  customerName: string;
  employeeId: string;
  employeeName: string;
  items: SaleItem[];
  totalAmount: number;
  employeeSignature: string | null;
  customerSignature: string | null;
  date: string;         // format: "YYYY-MM-DD"
  createdAt: string;    // ISO 8601
}

// Used when creating a transaction (sending TO the API)
// receiptNumber, id, employeeId, employeeName, totalAmount are all set by backend
export interface TransactionPayload {
  type: 'wholesale' | 'retail';
  customerName: string;
  employeeSignature: string | null;
  customerSignature: string | null;
  date: string;         // format: "YYYY-MM-DD"
  items: SaleItem[];
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export interface DailySalesReport {
  date: string;
  wholesaleTotal: number;
  retailTotal: number;
  totalSales: number;
  transactionCount: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Returned by the /api/login endpoint
export interface LoginResponse {
  token: string;
  user: User;
}

// Returned by login() and used in AuthContext
export interface LoginResult {
  success: boolean;
  message: string;
}