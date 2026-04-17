// src/components/sales/SalesPortal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Dumbbell, X } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.tsx';
import { Product, SaleItem, Transaction, TransactionPayload } from '@/types';
import { saveTransaction, getProductById } from '@/api/api.ts';

import WelcomeScreen    from './WelcomeScreen.tsx';
import CompletedScreen  from './CompletedScreen.tsx';
import ProductSearch    from './ProductSearch.tsx';
import CartPanel        from './CartPanel.tsx';
import CheckoutPanel    from './CheckoutPanel.tsx';
import ConfirmSaleModal from './ConfirmSaleModal.tsx';
import { ErrorBanner }  from '../../components/common/Banner.tsx';

interface SalesPortalProps {
  type: 'wholesale' | 'retail';
}

const SalesPortal: React.FC<SalesPortalProps> = ({ type }) => {
  const navigate        = useNavigate();
  const { user, logout } = useAuth();

  // ── View state ──────────────────────────────────────────────────────────
  const [view, setView] = useState<'welcome' | 'sale' | 'completed'>('welcome');

  // ── Sale state ───────────────────────────────────────────────────────────
  const [customerName,      setCustomerName]      = useState('');
  const [cart,              setCart]              = useState<SaleItem[]>([]);
  const [employeeSignature, setEmployeeSignature] = useState('');
  const [customerSignature, setCustomerSignature] = useState('');
  const [error,             setError]             = useState('');
  const [cartAddError,      setCartAddError]      = useState('');

  // ── Confirm modal ────────────────────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  // ── Completed transaction ─────────────────────────────────────────────────
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getPrice = (product: Product) =>
      type === 'wholesale' ? product.wholesalePrice : product.retailPrice;

  const calculateTotal = () =>
      cart.reduce((sum, item) => sum + item.totalAmount, 0);

  const resetSaleForm = () => {
    setCart([]);
    setCustomerName('');
    setEmployeeSignature('');
    setCustomerSignature('');
    setError('');
    setCartAddError('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  // ── Cart operations ───────────────────────────────────────────────────────
  const handleAddToCart = async (product: Product, quantity: number) => {
    setCartAddError('');

    if (quantity > product.quantity) {
      setCartAddError(`Insufficient stock. Only ${product.quantity} available.`);
      return;
    }

    const existing = cart.find((i) => i.productId === product.id);
    const totalQty = existing ? existing.quantity + quantity : quantity;

    if (totalQty > product.quantity) {
      setCartAddError(`Cannot add ${quantity} more. Total would exceed available stock.`);
      return;
    }

    const unitPrice = getPrice(product);

    if (existing) {
      setCart((prev) =>
          prev.map((i) =>
              i.productId === product.id
                  ? { ...i, quantity: totalQty, totalAmount: unitPrice * totalQty }
                  : i
          )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId:   product.id,
          productName: product.name,
          quantity,
          unitPrice,
          totalAmount: unitPrice * quantity,
        },
      ]);
    }
  };

  const handleUpdateQuantity = async (productId: string, delta: number) => {
    setError('');
    if (delta > 0) {
      try {
        const product = await getProductById(productId);
        const item    = cart.find((i) => i.productId === productId);
        if (item && item.quantity + delta > product.quantity) {
          setError(`Maximum available quantity: ${product.quantity}`);
          return;
        }
      } catch {
        setError('Could not verify stock. Please try again.');
        return;
      }
    }

    setCart((prev) =>
        prev.map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          return { ...item, quantity: newQty, totalAmount: item.unitPrice * newQty };
        })
    );
  };

  const handleSetQuantity = async (productId: string, qty: number) => {
    setError('');
    try {
      const product = await getProductById(productId);
      if (qty > product.quantity) {
        setError(`Maximum available quantity: ${product.quantity}`);
        return;
      }
    } catch {
      setError('Could not verify stock. Please try again.');
      return;
    }

    setCart((prev) =>
        prev.map((item) =>
            item.productId === productId
                ? { ...item, quantity: qty, totalAmount: item.unitPrice * qty }
                : item
        )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  // ── Sale completion ──────────────────────────────────────────────────────
  const handleCompleteSale = () => {
    setError('');
    if (cart.length === 0) {
      setError('Cart is empty. Add products to complete sale.');
      return;
    }
    if (!customerName.trim()) {
      setError('Please enter a customer name.');
      return;
    }
    setShowConfirm(true);
  };

  const confirmSale = async () => {
    setSubmitting(true);
    setError('');

    const payload: TransactionPayload = {
      type,
      customerName:      customerName.trim(),
      employeeSignature: employeeSignature || null,
      customerSignature: customerSignature || null,
      date:              format(new Date(), 'yyyy-MM-dd'),
      items:             cart,
    };

    try {
      const transaction = await saveTransaction(payload);
      setCompletedTransaction(transaction);
      setShowConfirm(false);
      resetSaleForm();
      setView('completed');
    } catch (err: unknown) {
      setShowConfirm(false);
      setError(
          err instanceof Error
              ? err.message
              : 'Failed to save transaction. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (view === 'welcome') {
    return (
        <WelcomeScreen
            type={type}
            username={user?.username ?? ''}
            onStartSale={() => setView('sale')}
            onLogout={handleLogout}
        />
    );
  }

  if (view === 'completed' && completedTransaction) {
    return (
        <CompletedScreen
            transaction={completedTransaction}
            type={type}
            onNewSale={() => { setCompletedTransaction(null); setView('sale'); }}
            onHome={() => { setCompletedTransaction(null); setView('welcome'); }}
        />
    );
  }

  const headerGradient = type === 'wholesale'
      ? 'from-blue-600 to-blue-700'
      : 'from-green-600 to-green-700';

  return (
      <div className="min-h-screen bg-gray-900">
        <ConfirmSaleModal
            open={showConfirm}
            customerName={customerName}
            cart={cart}
            total={calculateTotal()}
            type={type}
            loading={submitting}
            onConfirm={confirmSale}
            onCancel={() => setShowConfirm(false)}
        />

        {/* Header */}
        <header className={`bg-gradient-to-r ${headerGradient} py-3 px-6 shadow-lg sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-6 h-6 text-white" />
              <h1 className="text-base font-bold text-white tracking-wider">
                MUSCLE MATRIX — {type.charAt(0).toUpperCase() + type.slice(1)} Sale
              </h1>
            </div>
            <div className="flex items-center gap-4">
            <span className="text-white/70 text-sm hidden sm:block">
              Employee: {user?.username}
            </span>
              <button
                  onClick={() => { resetSaleForm(); setView('welcome'); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left panel */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Customer Name <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Enter customer name"
                />
              </div>

              <ProductSearch
                  type={type}
                  onAddToCart={handleAddToCart}
                  error={cartAddError}
                  onClearError={() => setCartAddError('')}
              />
            </div>

            {/* Right panel */}
            <div className="lg:col-span-3 space-y-4">
              <CartPanel
                  cart={cart}
                  type={type}
                  onUpdateQuantity={handleUpdateQuantity}
                  onSetQuantity={handleSetQuantity}
                  onRemove={handleRemoveItem}
              />
              <CheckoutPanel
                  type={type}
                  employeeUsername={user?.username ?? ''}
                  employeeSignature={employeeSignature}
                  customerSignature={customerSignature}
                  total={calculateTotal()}
                  cartEmpty={cart.length === 0}
                  onEmployeeSignatureChange={setEmployeeSignature}
                  onCustomerSignatureChange={setCustomerSignature}
                  onCompleteSale={handleCompleteSale}
              />
            </div>
          </div>
        </div>
      </div>
  );
};

export default SalesPortal;