import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Product } from '@/types';

interface LowStockAlertProps {
    products: Product[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ products }) => {
    if (products.length === 0) return null;

    return (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-bold text-red-400">Low Stock Alert</h3>
                <span className="ml-auto bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-1 rounded-full">
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-gray-800 rounded-lg p-3 flex justify-between items-center"
                    >
                        <span className="text-white text-sm truncate mr-2">{product.name}</span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex-shrink-0">
              {product.quantity} left
            </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LowStockAlert;