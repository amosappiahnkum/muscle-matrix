// Sales Portal Component - Wholesale and Retail Sales Interface

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Product, SaleItem, Transaction } from '../../types';
import { 
  searchProducts, 
  updateProductQuantity, 
  saveTransaction, 
  generateReceiptNumber,
  getProductById
} from '../../utils/database';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  Printer, 
  LogOut,
  Dumbbell,
  User,
  Package,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

interface SalesPortalProps {
  type: 'wholesale' | 'retail';
  onLogout: () => void;
}

const SalesPortal: React.FC<SalesPortalProps> = ({ type, onLogout }) => {
  const { user, logout } = useAuth();
  const [showSaleInterface, setShowSaleInterface] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [employeeSignature, setEmployeeSignature] = useState('');
  const [customerSignature, setCustomerSignature] = useState('');
  const [error, setError] = useState('');
  const [_success, setSuccess] = useState('');
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [quantityInputs, setQuantityInputs] = useState<{ [key: string]: string }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = searchProducts(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const getPrice = (product: Product) => {
    return type === 'wholesale' ? product.wholesalePrice : product.retailPrice;
  };

  const handleAddToCart = (product: Product) => {
    setError('');
    const quantity = parseInt(quantityInputs[product.id] || '1');

    if (isNaN(quantity) || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (quantity > product.quantity) {
      setError(`Insufficient stock. Only ${product.quantity} available.`);
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (totalQuantity > product.quantity) {
      setError(`Cannot add ${quantity} more. Total would exceed available stock.`);
      return;
    }

    const unitPrice = getPrice(product);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id
          ? { ...item, quantity: totalQuantity, totalAmount: unitPrice * totalQuantity }
          : item
      ));
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        totalAmount: unitPrice * quantity,
      };
      setCart([...cart, newItem]);
    }

    setQuantityInputs({ ...quantityInputs, [product.id]: '1' });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUpdateQuantity = (productId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const product = getProductById(productId);
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) return item;
        if (product && newQuantity > product.quantity) {
          setError(`Maximum available quantity: ${product.quantity}`);
          return item;
        }
        
        return {
          ...item,
          quantity: newQuantity,
          totalAmount: item.unitPrice * newQuantity,
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalAmount, 0);
  };

  const handleCompleteSale = () => {
    setError('');

    if (cart.length === 0) {
      setError('Cart is empty. Add products to complete sale.');
      return;
    }

    if (!customerName.trim()) {
      setError('Please enter customer name');
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const confirmSale = () => {
    setShowConfirmDialog(false);
    
    // Update stock for each item
    for (const item of cart) {
      const success = updateProductQuantity(item.productId, item.quantity);
      if (!success) {
        setError(`Failed to update stock for ${item.productName}`);
        return;
      }
    }

    // Create transaction
    const transaction: Transaction = {
      id: uuidv4(),
      receiptNumber: generateReceiptNumber(),
      type,
      customerName: customerName.trim(),
      employeeId: user?.id || '',
      employeeName: user?.username || '',
      items: cart,
      totalAmount: calculateTotal(),
      employeeSignature,
      customerSignature,
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
    };

    saveTransaction(transaction);
    setCompletedTransaction(transaction);
    setSuccess('Sale completed successfully!');
    
    // Reset form
    setCart([]);
    setCustomerName('');
    setEmployeeSignature('');
    setCustomerSignature('');
  };

  const cancelSale = () => {
    setShowConfirmDialog(false);
  };

  const handlePrintReceipt = (transaction: Transaction) => {
    const printContent = `
      <html>
        <head>
          <title>Receipt - ${transaction.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 15px; }
            .header h1 { font-size: 18px; margin: 0; }
            .header p { margin: 5px 0; font-size: 12px; color: #666; }
            .type-badge { display: inline-block; padding: 4px 12px; border-radius: 15px; font-size: 12px; margin-top: 10px; }
            .wholesale { background: #3B82F6; color: white; }
            .retail { background: #22C55E; color: white; }
            .info { margin-bottom: 15px; font-size: 12px; }
            .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
            th, td { padding: 8px 4px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #333; }
            .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; }
            .signature { text-align: center; width: 45%; }
            .signature-line { border-top: 1px solid #333; padding-top: 5px; margin-top: 40px; }
            .signature-name { margin-top: 5px; font-style: italic; }
            .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #666; border-top: 1px dashed #999; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚡ MUSCLE MATRIX ⚡</h1>
            <p>Phone: 0245349937</p>
            <p>Email: emmanueleshun558@gmail.com</p>
            <span class="type-badge ${transaction.type}">${transaction.type.toUpperCase()}</span>
          </div>
          <div class="info">
            <div class="info-row"><strong>Receipt #:</strong><span>${transaction.receiptNumber}</span></div>
            <div class="info-row"><strong>Date:</strong><span>${format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}</span></div>
            <div class="info-row"><strong>Customer:</strong><span>${transaction.customerName}</span></div>
            <div class="info-row"><strong>Served by:</strong><span>${transaction.employeeName}</span></div>
          </div>
          <table>
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${transaction.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">GH₵${item.unitPrice.toFixed(2)}</td>
                  <td style="text-align: right;">GH₵${item.totalAmount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">TOTAL: GH₵${transaction.totalAmount.toFixed(2)}</div>
          <div class="signatures">
            <div class="signature">
              <div class="signature-line">Employee Signature</div>
              <p class="signature-name">${transaction.employeeSignature || transaction.employeeName}</p>
            </div>
            <div class="signature">
              <div class="signature-line">Customer Signature</div>
              <p class="signature-name">${transaction.customerSignature || ''}</p>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your patronage!</p>
            <p>Quality Gym Products for Champions</p>
            <p>All sales are final. No refunds or exchanges.</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleNewSale = () => {
    setCompletedTransaction(null);
    setSuccess('');
    setShowSaleInterface(true);
  };

  // Welcome Screen
  if (!showSaleInterface) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <header className={`bg-gradient-to-r ${type === 'wholesale' ? 'from-blue-600 to-blue-700' : 'from-green-600 to-green-700'} py-4 px-6 shadow-lg`}>
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-xl font-bold text-white tracking-wider">MUSCLE MATRIX</h1>
                <p className="text-white/80 text-sm capitalize">{type} Portal</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </header>

        {/* Welcome Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Employee Info */}
            <div className={`bg-gradient-to-r ${type === 'wholesale' ? 'from-blue-600/20 to-blue-700/20' : 'from-green-600/20 to-green-700/20'} p-6 border-b border-gray-700`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${type === 'wholesale' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}>
                  <User className={`w-10 h-10 ${type === 'wholesale' ? 'text-blue-400' : 'text-green-400'}`} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Logged in as</p>
                  <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
                  <p className={`text-sm capitalize ${type === 'wholesale' ? 'text-blue-400' : 'text-green-400'}`}>
                    {type} Employee
                  </p>
                </div>
              </div>
            </div>

            {/* Start Sale Button */}
            <div className="p-8 text-center">
              <div className="mb-6">
                <span className="text-6xl">🏋️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Start Selling?</h3>
              <p className="text-gray-400 mb-8">
                Begin a new {type} transaction for your customer
              </p>
              <button
                onClick={() => setShowSaleInterface(true)}
                className={`px-8 py-4 ${type === 'wholesale' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} text-white text-lg font-bold rounded-xl transition-colors flex items-center gap-3 mx-auto`}
              >
                <ShoppingCart className="w-6 h-6" />
                Start Sale / Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed Transaction Screen
  if (completedTransaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sale Completed!</h2>
          <p className="text-gray-400 mb-6">Transaction recorded successfully</p>
          
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Receipt #</span>
              <span className="text-white font-mono">{completedTransaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Customer</span>
              <span className="text-white">{completedTransaction.customerName}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Items</span>
              <span className="text-white">{completedTransaction.items.length}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
              <span className="text-white">Total</span>
              <span className="text-orange-500">GH₵{completedTransaction.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handlePrintReceipt(completedTransaction)}
              className="w-full py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
            <button
              onClick={handleNewSale}
              className={`w-full py-3 ${type === 'wholesale' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} text-white font-medium rounded-lg transition-colors`}
            >
              New Sale
            </button>
            <button
              onClick={() => { setCompletedTransaction(null); setShowSaleInterface(false); }}
              className="w-full py-3 bg-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle direct quantity edit in cart
  const handleCartQuantityEdit = (productId: string, newQty: string) => {
    const qty = parseInt(newQty);
    if (isNaN(qty) || qty < 1) return;
    
    const product = getProductById(productId);
    if (!product) return;
    
    if (qty > product.quantity) {
      setError(`Maximum available quantity: ${product.quantity}`);
      return;
    }
    
    setCart(cart.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: qty,
          totalAmount: item.unitPrice * qty,
        };
      }
      return item;
    }));
    setEditingQuantity(null);
  };

  // Main Sales Interface
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-600 p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirm Sale</h3>
              <p className="text-gray-400">
                Are you sure you want to complete this transaction? This action cannot be undone.
              </p>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Customer</span>
                <span className="text-white font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Items</span>
                <span className="text-white font-medium">{cart.length}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
                <span className="text-white">Total</span>
                <span className="text-orange-500">GH₵{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelSale}
                className="flex-1 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSale}
                className={`flex-1 py-3 text-white font-medium rounded-lg transition-colors ${
                  type === 'wholesale' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                Yes, Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-gradient-to-r ${type === 'wholesale' ? 'from-blue-600 to-blue-700' : 'from-green-600 to-green-700'} py-3 px-6 shadow-lg sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-lg font-bold text-white tracking-wider">MUSCLE MATRIX — {type.charAt(0).toUpperCase() + type.slice(1)} Sale</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">Employee: {user?.username}</span>
            <button
              onClick={() => setShowSaleInterface(false)}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Panel - Product Search & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Name */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                placeholder="Enter customer name"
              />
            </div>

            {/* Product Search */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Search Products</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Type product name..."
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                  {searchResults.map(product => (
                    <div key={product.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-gray-400 text-sm">
                            Stock: <span className={product.quantity <= 10 ? 'text-red-400' : 'text-green-400'}>{product.quantity}</span>
                          </p>
                        </div>
                        <p className={`text-lg font-bold ${type === 'wholesale' ? 'text-blue-400' : 'text-green-400'}`}>
                          GH₵{getPrice(product).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          min="1"
                          max={product.quantity}
                          value={quantityInputs[product.id] || '1'}
                          onChange={(e) => setQuantityInputs({ ...quantityInputs, [product.id]: e.target.value })}
                          className="w-20 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center focus:outline-none focus:border-orange-500"
                        />
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.quantity === 0}
                          className={`flex-1 py-2 ${product.quantity === 0 ? 'bg-gray-600 cursor-not-allowed' : type === 'wholesale' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} text-white rounded transition-colors flex items-center justify-center gap-2`}
                        >
                          <Plus className="w-4 h-4" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Cart & Checkout */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cart */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className={`bg-gradient-to-r ${type === 'wholesale' ? 'from-blue-600/20 to-blue-700/20' : 'from-green-600/20 to-green-700/20'} p-4 border-b border-gray-700`}>
                <div className="flex items-center gap-2">
                  <ShoppingCart className={`w-5 h-5 ${type === 'wholesale' ? 'text-blue-400' : 'text-green-400'}`} />
                  <h3 className="text-lg font-bold text-white">Sales Cart</h3>
                  <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-sm text-gray-300">
                    {cart.length} items
                  </span>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Cart is empty. Search and add products.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {cart.map(item => (
                    <div key={item.productId} className="p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.productName}</p>
                        <p className="text-gray-400 text-sm">GH₵{item.unitPrice.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, -1)}
                          className="w-8 h-8 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        {editingQuantity === item.productId ? (
                          <input
                            type="number"
                            min="1"
                            defaultValue={item.quantity}
                            autoFocus
                            onBlur={(e) => handleCartQuantityEdit(item.productId, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCartQuantityEdit(item.productId, e.currentTarget.value);
                              }
                            }}
                            className="w-16 px-2 py-1 bg-gray-600 border border-orange-500 rounded text-white text-center focus:outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingQuantity(item.productId)}
                            className="w-12 py-1 bg-gray-700 text-white font-medium rounded hover:bg-gray-600 transition-colors"
                            title="Tap to edit quantity"
                          >
                            {item.quantity}
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, 1)}
                          className="w-8 h-8 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="w-24 text-right text-orange-400 font-bold">
                        GH₵{item.totalAmount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary & Checkout */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-4">
              {/* Receipt Info */}
              <div className="flex justify-between text-sm text-gray-400">
                <span>Date</span>
                <span>{format(new Date(), 'MMMM dd, yyyy HH:mm')}</span>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Employee Signature</label>
                  <input
                    type="text"
                    value={employeeSignature}
                    onChange={(e) => setEmployeeSignature(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 text-sm"
                    placeholder={user?.username}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Customer Signature</label>
                  <input
                    type="text"
                    value={customerSignature}
                    onChange={(e) => setCustomerSignature(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 text-sm"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Total */}
              <div className={`flex justify-between items-center p-4 rounded-lg ${type === 'wholesale' ? 'bg-blue-600/20' : 'bg-green-600/20'}`}>
                <span className="text-xl font-bold text-white">Total Amount</span>
                <span className="text-3xl font-bold text-orange-500">GH₵{calculateTotal().toFixed(2)}</span>
              </div>

              {/* Complete Sale Button */}
              <button
                onClick={handleCompleteSale}
                disabled={cart.length === 0}
                className={`w-full py-4 text-white text-lg font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  cart.length === 0 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : type === 'wholesale' 
                      ? 'bg-blue-600 hover:bg-blue-500' 
                      : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                <Check className="w-6 h-6" />
                Complete Sale & Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPortal;
