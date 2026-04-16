// Types for the MUSCLE MATRIX Sales Management System

export type UserRole = 'admin' | 'wholesale' | 'retail';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
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

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  type: 'wholesale' | 'retail';
  customerName: string;
  employeeId: string;
  employeeName: string;
  items: SaleItem[];
  totalAmount: number;
  employeeSignature: string;
  customerSignature: string;
  date: string;
  createdAt: string;
}

export interface DailySalesReport {
  date: string;
  wholesaleTotal: number;
  retailTotal: number;
  totalSales: number;
  transactionCount: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
