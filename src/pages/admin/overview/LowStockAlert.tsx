import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { Product } from '@/types';

interface LowStockAlertProps {
  products: Product[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ products }) => {
  if (products.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="bg-red-50 p-2 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
          Low Stock Alert
        </h3>
        <span className="ml-auto bg-red-50 text-red-500 text-xs font-semibold px-3 py-1 rounded-full border border-red-100">
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Scrollable table */}
      <div className="overflow-auto" style={{ maxHeight: 320 }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 sticky top-0 z-10">
              <th className="text-left text-xs font-semibold text-gray-400 tracking-wider uppercase px-6 py-3">#</th>
              <th className="text-left text-xs font-semibold text-gray-400 tracking-wider uppercase px-4 py-3">Product</th>
              <th className="text-left text-xs font-semibold text-gray-400 tracking-wider uppercase px-4 py-3">Quantity</th>
              {/* <th className="text-left text-xs font-semibold text-gray-400 tracking-wider uppercase px-4 py-3">Price</th> */}
              <th className="text-right text-xs font-semibold text-gray-400 tracking-wider uppercase px-6 py-3">Qty Left</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product, index) => (
              <tr
                key={product.id}
                className="hover:bg-red-50/40 transition-colors duration-150"
              >
                <td className="px-6 py-3 text-gray-400 text-xs">{index + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-lg p-1.5 flex-shrink-0">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-800 truncate max-w-[160px]">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{product.quantity ?? '—'}</td>
                {/* <td className="px-4 py-3 text-gray-700 font-medium">
                  {product.price != null
                    ? `GH₵${Number(product.price).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
                    : '—'}
                </td> */}
                <td className="px-6 py-3 text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      product.quantity <= 3
                        ? 'bg-red-100 text-red-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    {product.quantity} left
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockAlert;