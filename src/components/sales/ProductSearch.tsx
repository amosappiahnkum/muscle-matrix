import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus } from 'lucide-react';
import { Product } from '@/types';
import { searchProducts } from '@/api/api.ts';
import Button from '../common/Button.tsx';

interface ProductSearchProps {
  type: 'wholesale' | 'retail';
  onAddToCart: (product: Product, quantity: number) => void;
  error: string;
  onClearError: () => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  type,
  onAddToCart,
  error,
  onClearError,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced async search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchProducts(query.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const getPrice = (product: Product) =>
    type === 'wholesale' ? product.wholesalePrice : product.retailPrice;

  const handleAdd = (product: Product) => {
    const qty = parseInt(quantityInputs[product.id] || '1');
    if (isNaN(qty) || qty < 1) return;
    onAddToCart(product, qty);
    setQuantityInputs((prev) => ({ ...prev, [product.id]: '1' }));
    setQuery('');
    setResults([]);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-3">
      <label className="block text-gray-300 text-sm font-semibold">Search Products</label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {searching && (
          <svg className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onClearError(); }}
          className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
          placeholder="Type product name…"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {results.map((product) => (
            <div key={product.id} className="bg-gray-700/60 rounded-lg p-3 border border-gray-600/50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-white font-medium text-sm">{product.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Stock:{' '}
                    <span className={product.quantity <= 10 ? 'text-red-400 font-semibold' : 'text-green-400'}>
                      {product.quantity}
                    </span>
                  </p>
                </div>
                <p className={`text-base font-bold ${type === 'wholesale' ? 'text-blue-400' : 'text-green-400'}`}>
                  GH₵{getPrice(product).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantityInputs[product.id] ?? '1'}
                  onChange={(e) =>
                    setQuantityInputs((prev) => ({ ...prev, [product.id]: e.target.value }))
                  }
                  className="w-20 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center text-sm focus:outline-none focus:border-orange-500"
                />
                <Button
                  variant="primary"
                  color={type === 'wholesale' ? 'blue' : 'green'}
                  size="sm"
                  fullWidth
                  disabled={product.quantity === 0}
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => handleAdd(product)}
                >
                  {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {query.length > 0 && !searching && results.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-2">No products found for "{query}"</p>
      )}
    </div>
  );
};

export default ProductSearch;
