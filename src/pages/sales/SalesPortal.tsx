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
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const [view, setView] = useState<'welcome' | 'sale' | 'completed'>('welcome');

  const [customerName,      setCustomerName]      = useState('');
  const [cart,              setCart]              = useState<SaleItem[]>([]);
  const [employeeSignature, setEmployeeSignature] = useState('');
  const [customerSignature, setCustomerSignature] = useState('');
  const [error,             setError]             = useState('');
  const [cartAddError,      setCartAddError]      = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

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

  const isWholesale     = type === 'wholesale';
  const headerGradient  = isWholesale ? 'from-blue-700 to-blue-600'  : 'from-green-700 to-green-600';
  const accentFocus     = isWholesale ? 'focus:border-blue-400'       : 'focus:border-green-400';
  const accentText      = isWholesale ? 'text-blue-600'               : 'text-green-600';
  const accentBorder    = isWholesale ? 'border-blue-200'             : 'border-green-200';
  const accentInputRing = isWholesale ? 'focus:ring-blue-100'         : 'focus:ring-green-100';

  return (
    // ── Full-screen shell — white background, fixed height so panels scroll independently
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

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

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={`bg-gradient-to-r ${headerGradient} shrink-0 px-6 py-3 shadow-md z-40`}>
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-5 h-5 text-white/90" />
            <div>
              <h1 className="text-sm font-black text-white tracking-widest uppercase">
                Muscle Matrix
              </h1>
              <p className="text-white/60 text-xs tracking-wide">
                {isWholesale ? 'Wholesale' : 'Retail'} Point of Sale
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden sm:block text-right">
              <p className="text-white/50 text-xs uppercase tracking-widest">Logged in as</p>
              <p className="text-white font-semibold text-sm">{user?.username}</p>
            </div>
            <button
              onClick={() => { resetSaleForm(); setView('welcome'); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="shrink-0 px-6 pt-3 max-w-screen-2xl mx-auto w-full">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {/* ── Body — two columns, each scrolls independently ──────────────── */}
<div className="flex-1 overflow-hidden max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-4">
  <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4">

    {/* ── LEFT: Products (dominant) ────────────────────────────────── */}
    <div className="lg:col-span-7 h-full overflow-hidden">
      <ProductSearch
        type={type}
        onAddToCart={handleAddToCart}
        error={cartAddError}
        onClearError={() => setCartAddError('')}
      />
    </div>

    {/* ── RIGHT: Cart + Customer + Checkout ───────────────────────── */}
    <div className="lg:col-span-5 flex flex-col gap-3 h-full overflow-hidden">

      {/* Cart — takes all remaining space, scrolls inside */}
      <div className="flex-1 overflow-hidden">
        <CartPanel
          cart={cart}
          type={type}
          onUpdateQuantity={handleUpdateQuantity}
          onSetQuantity={handleSetQuantity}
          onRemove={handleRemoveItem}
        />
      </div>

      {/* Customer name + Checkout — compact, pinned at bottom */}
      <div className="shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Customer name row */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Customer Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:bg-white focus:ring-2 ${accentInputRing} ${accentFocus} transition-all`}
          />
        </div>

        {/* Checkout panel — no outer card, sits inside this card */}
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
      </div>
    
  );
};

export default SalesPortal;