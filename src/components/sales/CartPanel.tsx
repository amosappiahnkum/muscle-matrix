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

  const accentColor = type === 'wholesale' ? 'text-blue-400' : 'text-green-400';
  const bgAccent    = type === 'wholesale' ? 'from-blue-600/20 to-blue-700/20' : 'from-green-600/20 to-green-700/20';

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${bgAccent} px-4 py-3 border-b border-gray-700 flex items-center gap-2`}>
        <ShoppingCart className={`w-5 h-5 ${accentColor}`} />
        <h3 className="text-base font-bold text-white">Sales Cart</h3>
        <span className="ml-auto bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
          {cart.length} {cart.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Empty state */}
      {cart.length === 0 ? (
        <div className="py-10 text-center">
          <Package className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Cart is empty. Search and add products above.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-700/60">
          {cart.map((item) => (
            <div key={item.productId} className="px-4 py-3 flex items-center gap-3">
              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.productName}</p>
                <p className="text-gray-400 text-xs">GH₵{item.unitPrice.toFixed(2)} each</p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdateQuantity(item.productId, -1)}
                  className="w-7 h-7 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {editingId === item.productId ? (
                  <input
                    type="number"
                    min="1"
                    defaultValue={item.quantity}
                    autoFocus
                    className="w-14 px-1.5 py-1 bg-gray-600 border border-orange-500 rounded text-white text-center text-sm focus:outline-none"
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
                    className="w-10 h-7 bg-gray-700 text-white text-sm font-medium rounded hover:bg-gray-600 transition-colors"
                  >
                    {item.quantity}
                  </button>
                )}

                <button
                  onClick={() => onUpdateQuantity(item.productId, 1)}
                  className="w-7 h-7 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Line total */}
              <p className="w-20 text-right text-orange-400 font-bold text-sm">
                GH₵{item.totalAmount.toFixed(2)}
              </p>

              {/* Remove */}
              <button
                onClick={() => onRemove(item.productId)}
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartPanel;
