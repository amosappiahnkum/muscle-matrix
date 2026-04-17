import { User, Product, Transaction, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

const DB_KEYS = {
  USERS: 'muscle_matrix_users',
  PRODUCTS: 'muscle_matrix_products',
  TRANSACTIONS: 'muscle_matrix_transactions',
};

// Initialize default admin-layouts if not exists
export const initializeDatabase = () => {
  const users = getUsers();
  if (!users.find(u => u.role === 'admin')) {
    const defaultAdmin: User = {
      id: uuidv4(),
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    saveUser(defaultAdmin);
  }
};

// USER OPERATIONS
export const getUsers = (): User[] => {
  const data = localStorage.getItem(DB_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
};

export const deleteUser = (userId: string): void => {
  const users = getUsers().filter(u => u.id !== userId);
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
};

export const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password) || null;
};

export const getUsersByRole = (role: UserRole): User[] => {
  return getUsers().filter(u => u.role === role);
};

// PRODUCT OPERATIONS
export const getProducts = (): Product[] => {
  const data = localStorage.getItem(DB_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  if (existingIndex >= 0) {
    products[existingIndex] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    products.push(product);
  }
  localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
};

export const deleteProduct = (productId: string): void => {
  const products = getProducts().filter(p => p.id !== productId);
  localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
};

export const getProductById = (productId: string): Product | undefined => {
  return getProducts().find(p => p.id === productId);
};

export const updateProductQuantity = (productId: string, quantitySold: number): boolean => {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (product && product.quantity >= quantitySold) {
    product.quantity -= quantitySold;
    product.updatedAt = new Date().toISOString();
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    return true;
  }
  return false;
};

export const getLowStockProducts = (threshold: number = 10): Product[] => {
  return getProducts().filter(p => p.quantity <= threshold);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return getProducts().filter(p => 
    p.name.toLowerCase().includes(lowerQuery)
  );
};

// TRANSACTION OPERATIONS
export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(DB_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const getTransactionsByDate = (date: string): Transaction[] => {
  return getTransactions().filter(t => t.date === date);
};

export const getTransactionsByType = (type: 'wholesale' | 'retail'): Transaction[] => {
  return getTransactions().filter(t => t.type === type);
};

export const generateReceiptNumber = (): string => {
  const prefix = 'MMX'; // MUSCLE MATRIX
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const getDailySalesReport = (date: string) => {
  const transactions = getTransactionsByDate(date);
  const wholesaleTotal = transactions
    .filter(t => t.type === 'wholesale')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const retailTotal = transactions
    .filter(t => t.type === 'retail')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  return {
    date,
    wholesaleTotal,
    retailTotal,
    totalSales: wholesaleTotal + retailTotal,
    transactionCount: transactions.length,
  };
};

// BACKUP & RESTORE
export const exportDatabase = (): string => {
  const backup = {
    backupName: 'Muscle Matrix Backup',
    businessName: 'MUSCLE MATRIX',
    users: getUsers(),
    products: getProducts(),
    transactions: getTransactions(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(backup, null, 2);
};

export const importDatabase = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.users) localStorage.setItem(DB_KEYS.USERS, JSON.stringify(data.users));
    if (data.products) localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(data.products));
    if (data.transactions) localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
};

// RESET ADMIN CREDENTIALS TO DEFAULT
// Contact emmanueleshun558@gmail.com or 0245349937 for assistance
export const resetAdminCredentials = (): boolean => {
  try {
    const users = getUsers();
    const adminIndex = users.findIndex(u => u.role === 'admin');
    if (adminIndex >= 0) {
      users[adminIndex].username = 'admin';
      users[adminIndex].password = 'admin123';
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Reset failed:', error);
    return false;
  }
};
