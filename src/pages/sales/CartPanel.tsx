import React, { useState } from 'react';
import { ShoppingCart, Package, Minus, Plus, Trash2 } from 'lucide-react';
import { SaleItem } from '@/types';

interface CartPanelProps {
  cart: SaleItem[];
  type: 'wholesale' | 'retail';
  onUpdateQuantity: (productId: string, delta: number) => void;
  onSetQuantity: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
}

const CartPanel: React.FC<CartPanelProps> = ({
  cart,
  type,
  onUpdateQuantity,
  onSetQuantity,
  onRemove,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const accentColor  = type === 'wholesale' ? 'text-blue-600'  : 'text-green-600';
  const accentBadge  = type === 'wholesale' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100';
  const headerBorder = type === 'wholesale' ? 'border-blue-100' : 'border-green-100';

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Header — fixed, never scrolls */}
      <div className={`shrink-0 flex items-center gap-2 px-5 py-4 border-b ${headerBorder}`}>
        <ShoppingCart className={`w-4 h-4 ${accentColor}`} />
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Sales Cart</h3>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border ${accentBadge}`}>
          {cart.length} {cart.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Body — scrolls when items overflow */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Cart is empty</p>
            <p className="text-gray-400 text-xs mt-1">Click a product on the left to add it</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-sm font-semibold truncate">{item.productName}</p>
                  <p className="text-gray-400 text-xs mt-0.5">GH₵{item.unitPrice.toFixed(2)} each</p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onUpdateQuantity(item.productId, -1)}
                    className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  {editingId === item.productId ? (
                    <input
                      type="number"
                      min="1"
                      defaultValue={item.quantity}
                      autoFocus
                      className="w-12 px-1 py-1 border border-orange-400 rounded-lg text-gray-800 text-center text-sm focus:outline-none bg-orange-50"
                      onBlur={(e) => {
                        const v = parseInt(e.target.value);
                        if (!isNaN(v) && v > 0) onSetQuantity(item.productId, v);
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const v = parseInt(e.currentTarget.value);
                          if (!isNaN(v) && v > 0) onSetQuantity(item.productId, v);
                          setEditingId(null);
                        }
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingId(item.productId)}
                      title="Click to edit quantity"
                      className="w-10 h-7 border border-gray-200 bg-white text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      {item.quantity}
                    </button>
                  )}

                  <button
                    onClick={() => onUpdateQuantity(item.productId, 1)}
                    className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Line total */}
                <p className="w-20 text-right text-orange-500 font-black text-sm shrink-0">
                  GH₵{item.totalAmount.toFixed(2)}
                </p>

                {/* Remove */}
                <button
                  onClick={() => onRemove(item.productId)}
                  className="shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer summary — only shows when cart has items, fixed at bottom */}
      {cart.length > 0 && (
        <div className="shrink-0 px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">
            {cart.reduce((sum, i) => sum + i.quantity, 0)} unit{cart.reduce((sum, i) => sum + i.quantity, 0) !== 1 ? 's' : ''} · {cart.length} product{cart.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm font-black text-gray-700">
            GH₵{cart.reduce((sum, i) => sum + i.totalAmount, 0).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default CartPanel;