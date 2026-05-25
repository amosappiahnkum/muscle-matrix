import React, { useEffect } from 'react';
import { X, Package, Layers } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Product } from '@/types';
import { ExpiryBadge } from './ExpiryBadge';

// Updated interface to include batches array passed from parent container
interface Batch {
  id: string;
  batchCode: string;
  remaining?: number;
  expiryDate?: string;
  supplier?: string;
}

interface ProductDetailPanelProps {
  product: Product | null;
  batches: Batch[]; // Accept filtered product batches
  onClose: () => void;
}

export const ProductDetailPanel: React.FC<ProductDetailPanelProps> = ({ product, batches, onClose }) => {
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
      {/* Landscape Modal Card (max-w-3xl gives it the wide landscape look) */}
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden
          animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 border border-blue-100 p-1.5 rounded-lg">
              <Package size={16} className="text-blue-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Product Management Details</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Two-Column Landscape Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          
          {/* Left Column: Core Metrics */}
          <div className="p-6 space-y-4">
            {/* Name */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Name</p>
              <p className="text-base font-bold text-gray-800">{product.name}</p>
            </div>

            {/* Stock + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Total Stock</p>
                <p className={`text-2xl font-black ${
                  product.quantity <= 10 ? 'text-red-600' :
                  product.quantity <= 50 ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {product.quantity}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Status</p>
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mt-1 ${
                  product.quantity <= 10 ? 'bg-red-50 text-red-600' :
                  product.quantity <= 50 ? 'bg-amber-50 text-amber-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  {product.quantity <= 10 ? 'Low' : product.quantity <= 50 ? 'Medium' : 'Good'}
                </span>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Cost</p>
                <p className="text-sm font-bold text-gray-700">GH₵{product.costPrice.toFixed(2)}</p>
              </div>
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
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5">Primary Expiry</p>
              <ExpiryBadge
                expiryDate={product.expiryDate ?? null}
                isExpired={product.isExpired ?? false}
                isExpiringSoon={product.isExpiringSoon ?? false}
              />
            </div>

            {/* System Dates */}
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

          {/* Right Column: Associated Batches */}
          <div className="p-6 bg-gray-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers size={14} className="text-gray-400" />
                <h4 className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                  Batches Registered Under Product
                </h4>
              </div>

              {batches.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl bg-white p-4 text-center">
                  <Layers size={24} className="text-gray-300 mb-1" />
                  <p className="text-xs font-medium text-gray-400">No batches linked yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {batches.map((b) => (
                    <div 
                      key={b.id} 
                      className="bg-white p-3 rounded-xl border border-gray-150 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                    >
                      <div>
                        <p className="font-mono text-xs font-bold text-gray-800">{b.batchCode}</p>
                        {b.supplier && (
                          <p className="text-[10px] text-gray-400 mt-0.5">Vendor: {b.supplier}</p>
                        )}
                        {b.expiryDate && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Expires: {format(parseISO(b.expiryDate), 'dd MMM yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="text-right whitespace-nowrap bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                        <span className="text-[10px] uppercase text-gray-400 block font-semibold">Remaining</span>
                        <span className="text-xs font-bold text-gray-700 tabular-nums">{b.remaining ?? 0} units</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button at bottom of right column layout structure */}
            <div className="mt-4 pt-3 border-t border-gray-100 hidden md:block">
              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold transition-colors"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>

        {/* Fallback Mobile Button (Visible only on small screens) */}
        <div className="px-6 pb-5 md:hidden">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};