import React, { useState, useEffect } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import { Product } from '@/types';
import { getProducts } from '@/api/api.ts';
import DataTable, { Column } from '../../components/common/DataTable.tsx';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [flash, setFlash]       = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setFiltered(data);
      } catch {
        setProducts([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    setFiltered(q ? products.filter(p => p.name.toLowerCase().includes(q)) : products);
  }, [query, products]);

  const getPrice = (p: Product) =>
    type === 'wholesale' ? p.wholesalePrice : p.retailPrice;

  const handleAdd = (product: Product) => {
    if (product.quantity === 0) return;
    onAddToCart(product, 1);
    onClearError();
    setFlash(product.id);
    setTimeout(() => setFlash(null), 500);
  };

  const isWholesale = type === 'wholesale';
  const accentText  = isWholesale ? 'text-blue-600'                 : 'text-green-600';
  const accentBtn   = isWholesale ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';
  const accentFocus = isWholesale ? 'focus:border-blue-400'         : 'focus:border-green-400';

  const columns: Column<Product>[] = [
    {
      key:    'name',
      header: 'Product',
      align:  'left',
      render: (product) => (
        <span className={`text-sm font-semibold transition-colors duration-150 ${
          flash === product.id ? (isWholesale ? 'text-blue-600' : 'text-green-600') : 'text-gray-800'
        }`}>
          {product.name}
        </span>
      ),
    },
    {
      key:    'stock',
      header: 'Stock',
      align:  'center',
      width:  '80px',
      render: (product) => {
        const outOfStock = product.quantity === 0;
        const lowStock   = product.quantity > 0 && product.quantity <= 10;
        return (
          <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
            outOfStock ? 'bg-gray-100 text-gray-400'
            : lowStock  ? 'bg-amber-50 text-amber-600'
            : 'bg-emerald-50 text-emerald-600'
          }`}>
            {product.quantity}
          </span>
        );
      },
    },
    {
      key:    'price',
      header: 'Price',
      align:  'right',
      width:  '110px',
      render: (product) => (
        <span className={`text-sm font-black tracking-tight ${
          product.quantity === 0 ? 'text-gray-300' : accentText
        }`}>
          GH₵{getPrice(product).toFixed(2)}
        </span>
      ),
    },
    {
      key:    'add',
      header: 'Add',
      align:  'center',
      width:  '60px',
      render: (product) => {
        const outOfStock = product.quantity === 0;
        return (
          <button
            onClick={() => handleAdd(product)}
            disabled={outOfStock}
            title={outOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
            className={`
              w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all duration-150
              ${outOfStock
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : `${accentBtn} text-white shadow-sm hover:shadow active:scale-90`
              }
            `}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-widest">Products</h2>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {filtered.length} / {products.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); onClearError(); }}
            placeholder="Search by product name…"
            className={`w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${accentFocus}`}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {error && (
          <p className="mt-2 text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* ── DataTable ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <Package className="w-8 h-8 text-gray-300" />
            <p className="text-gray-400 text-sm">
              {query ? `No results for "${query}"` : 'No products available.'}
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(p) => p.id}
            loading={loading}
            pageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No products found."
          />
        )}
      </div>

    </div>
  );
};

export default ProductSearch;