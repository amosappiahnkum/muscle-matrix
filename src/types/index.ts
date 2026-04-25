// ─── Auth & Users ─────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'wholesale' | 'retail';

export interface User {
  id:        string;
  name:      string | null;
  username:  string;
  role:      UserRole;
  createdAt: string;
}

export interface UserPayload {
  username:  string;
  password:  string;
  role:      UserRole;
  name?:     string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user:            User | null;
}

export interface LoginResponse {
  token: string;
  user:  User;
}

export interface LoginResult {
  success: boolean;
  message: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface Product {
  id:             string;
  name:           string;
  quantity:       number;
  expiryDate:     string | null;   // camelCase to match toFrontendArray()
  isExpired:      boolean;         // computed by backend model
  isExpiringSoon: boolean;         // computed by backend model
  wholesalePrice: number;
  retailPrice:    number;
  createdAt:      string;
  updatedAt:      string;
}

export interface ProductPayload {
  name:           string;
  quantity:       number;
  wholesalePrice: number;
  retailPrice:    number;
  expiry_date?:   string | null;   
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export type InventoryEntryType = 'initial' | 'restock' | 'sale' | 'adjustment';

export interface InventoryEntry {
  id:             string;
  productId:      string;
  productName:    string;
  type:           InventoryEntryType;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter:  number;
  transactionId:  string | null;
  note:           string | null;
  createdBy:      string | null;
  createdAt:      string;
}

export interface RestockPayload {
  productId:    string;
  quantity:     number;
  note?:        string;
  expiry_date?: string | null;   // optional — updates the product's expiry on restock
}

export interface AdjustPayload {
  productId:    string;
  quantity:     number;          // positive or negative
  note?:        string;
  expiry_date?: string | null;
}

// ─── Sales & Transactions ─────────────────────────────────────────────────────

export interface SaleItem {
  productId:   string;
  productName: string;
  quantity:    number;
  unitPrice:   number;
  totalAmount: number;
}

export interface Transaction {
  id:                string;
  receiptNumber:     string;
  type:              'wholesale' | 'retail';
  customerName:      string;
  employeeId:        string;
  employeeName:      string;
  items:             SaleItem[];
  totalAmount:       number;
  employeeSignature: string | null;
  customerSignature: string | null;
  date:              string;
  createdAt:         string;
}

export interface TransactionPayload {
  type:              'wholesale' | 'retail';
  customerName:      string;
  employeeSignature: string | null;
  customerSignature: string | null;
  date:              string;
  items:             SaleItem[];
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface DailySalesReport {
  date:             string;
  wholesaleTotal:   number;
  retailTotal:      number;
  totalSales:       number;
  transactionCount: number;
}

export const BUSINESS_NAME  = 'MUSCLE MATRIX';
export const BUSINESS_PHONE = '0245349937';
export const BUSINESS_EMAIL = 'emmanueleshun558@gmail.com';

export type DateRange = 'today' | 'week' | 'month' | 'all' | 'custom';
export type SaleType  = 'all' | 'wholesale' | 'retail';

export interface ReportSummary {
  wholesaleTotal:   number;
  retailTotal:      number;
  totalSales:       number;
  transactionCount: number;
  wholesaleCount:   number;
  retailCount:      number;
}

export const emptyReport: ReportSummary = {
  wholesaleTotal: 0, retailTotal: 0, totalSales: 0,
  transactionCount: 0, wholesaleCount: 0, retailCount: 0,
};