import React, { useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Product } from '@/types';
import { ExpiryBadge } from './ExpiryBadge';

interface ProductDetailPanelProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailPanel: React.FC<ProductDetailPanelProps> = ({ product, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!product) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden
          animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 border border-blue-100 p-1.5 rounded-lg">
              <Package size={14} className="text-blue-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Product Details</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">

          {/* Name */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Name</p>
            <p className="text-base font-bold text-gray-800">{product.name}</p>
          </div>

          {/* Stock + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Stock</p>
              <p className={`text-2xl font-black ${
                product.quantity <= 10 ? 'text-red-600' :
                product.quantity <= 50 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {product.quantity}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Status</p>
              <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                product.quantity <= 10 ? 'bg-red-50 text-red-600' :
                product.quantity <= 50 ? 'bg-amber-50 text-amber-600' :
                'bg-green-50 text-green-600'
              }`}>
                {product.quantity <= 10 ? 'Low' : product.quantity <= 50 ? 'Medium' : 'Good'}
              </span>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Wholesale</p>
              <p className="text-sm font-bold text-blue-600">GH₵{product.wholesalePrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Retail</p>
              <p className="text-sm font-bold text-green-600">GH₵{product.retailPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Expiry */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5">Expiry</p>
            <ExpiryBadge
              expiryDate={product.expiryDate ?? null}
              isExpired={product.isExpired ?? false}
              isExpiringSoon={product.isExpiringSoon ?? false}
            />
          </div>

          {/* Dates */}
          <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Added</p>
              <p className="text-xs text-gray-500">{format(parseISO(product.createdAt), 'dd MMM yyyy')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Updated</p>
              <p className="text-xs text-gray-500">{format(parseISO(product.updatedAt), 'dd MMM yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600
              text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};