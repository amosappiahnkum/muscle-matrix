import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, RotateCcw } from 'lucide-react';
import { format, isToday, isThisWeek, parseISO } from 'date-fns';
import { getProducts, getInventoryLog, addStock } from '@/api/api.ts';
import { Product, InventoryEntry } from '@/types';
import DataTable, { Column } from '@/components/common/DataTable.tsx';
import Button from '@/components/common/Button.tsx';
import { SuccessBanner } from '@/components/common/Banner.tsx';

import { ChangeBadge }   from './components/ChangeBadge';
import { TypeBadge }     from './components/TypeBadge';
import { ExpiryBadge }   from './components/ExpiryBadge';
import { AddStockModal } from './components/AddStockModal';
import { ProductDetailPanel }  from './components/ProductDetailPanel';
import {
  InventoryFilters,
  FilterType, DateRange, ExpiryFilter,
} from './components/InventoryFilters';

// ── Main Component ────────────────────────────────────────────────────────────
const InventoryLog: React.FC = () => {
  const [entries,         setEntries]         = useState<InventoryEntry[]>([]);
  const [products,        setProducts]        = useState<Product[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState('');
  const [typeFilter,      setTypeFilter]      = useState<FilterType>('all');
  const [dateRange,       setDateRange]       = useState<DateRange>('all');
  const [expiryFilter,    setExpiryFilter]    = useState<ExpiryFilter>('all');
  const [customFrom,      setCustomFrom]      = useState('');
  const [customTo,        setCustomTo]        = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [modalLoading,    setModalLoading]    = useState(false);
  const [modalError,      setModalError]      = useState('');
  const [success,         setSuccess]         = useState('');

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [log, prods] = await Promise.all([getInventoryLog(), getProducts()]);
      setEntries(log);
      setProducts(prods);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAddStock = async (
    productId: string,
    quantity: number,
    note: string,
    expiryDate: string,
  ) => {
    setModalError('');
    if (!productId)                { setModalError('Please select a product.'); return; }
    if (!quantity || quantity < 1) { setModalError('Quantity must be at least 1.'); return; }
    setModalLoading(true);
    try {
      await addStock({ productId, quantity, note, expiry_date: expiryDate || undefined });
      flash('Stock added successfully.');
      setModalOpen(false);
      await load();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to add stock.');
    } finally {
      setModalLoading(false);
    }
  };


  const handleProductClick = (entry: InventoryEntry) => {
    const product = products.find((p) => p.id === entry.productId);
    if (!product) return;                                    
    setSelectedProduct((prev) =>
      prev?.id === product.id ? null : product             
    );
  };

  // ── Filters ───────────────────────────────────────────────────────────────
  const filtered = entries.filter((e) => {
    if (selectedProduct && e.productId !== selectedProduct.id) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter)         return false;

    if (dateRange === 'today'  && !isToday(parseISO(e.createdAt)))    return false;
    if (dateRange === 'week'   && !isThisWeek(parseISO(e.createdAt))) return false;
    if (dateRange === 'custom') {
      const d = parseISO(e.createdAt);
      if (customFrom && d < parseISO(customFrom)) return false;
      if (customTo   && d > parseISO(customTo))   return false;
    }

    if (expiryFilter !== 'all') {
      const product = products.find((p) => p.id === e.productId);
      if (expiryFilter === 'expired'      && !product?.isExpired)      return false;
      if (expiryFilter === 'expiringSoon' && !product?.isExpiringSoon) return false;
      if (expiryFilter === 'valid' && (
        product?.isExpired || product?.isExpiringSoon || !product?.expiryDate
      )) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      return e.productName.toLowerCase().includes(q) || (e.note ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: Column<InventoryEntry>[] = [
    {
      key: 'productName', header: 'Product',
      render: (e) => {
        const product = products.find((p) => p.id === e.productId);
        return (
          <button
            onClick={() => handleProductClick(e)}
            className="text-left group"
          >
            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {e.productName}
            </p>
            {e.createdBy && (
              <p className="text-gray-400 text-xs mt-0.5">by {e.createdBy}</p>
            )}
            {product && (
              <div className="mt-1">
                <ExpiryBadge
                  expiryDate={product.expiryDate ?? null}
                  isExpired={product.isExpired ?? false}
                  isExpiringSoon={product.isExpiringSoon ?? false}
                />
              </div>
            )}
          </button>
        );
      },
    },
    {
      key: 'type', header: 'Type', align: 'center',
      render: (e) => <TypeBadge type={e.type} />,
    },
    {
      key: 'quantityBefore', header: 'Before', align: 'center',
      render: (e) => <span className="text-gray-400 tabular-nums text-sm">{e.quantityBefore}</span>,
    },
    {
      key: 'quantityChange', header: 'Change', align: 'center',
      render: (e) => <ChangeBadge change={e.quantityChange} />,
    },
    {
      key: 'quantityAfter', header: 'After', align: 'center',
      render: (e) => <span className="text-gray-900 font-semibold tabular-nums text-sm">{e.quantityAfter}</span>,
    },
    {
      key: 'note', header: 'Note',
      render: (e) => <span className="text-gray-400 text-xs italic">{e.note ?? '—'}</span>,
    },
    {
      key: 'createdAt', header: 'Date', align: 'right',
      render: (e) => (
        <span className="text-gray-400 text-xs tabular-nums">
          {format(parseISO(e.createdAt), 'dd MMM yyyy')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
            <ClipboardList size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Inventory Log</h3>
            <p className="text-gray-400 text-sm">Track all stock movements and changes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" color="gray" icon={<RotateCcw size={15} />} onClick={load}>
            Refresh
          </Button>
          <Button
            variant="primary"
            color="orange"
            icon={<Plus size={16} />}
            onClick={() => { setModalError(''); setModalOpen(true); }}
          >
            Add Stock
          </Button>
        </div>
      </div>

      {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <InventoryFilters
        search={search}
        typeFilter={typeFilter}
        dateRange={dateRange}
        expiryFilter={expiryFilter}
        customFrom={customFrom}
        customTo={customTo}
        filteredCount={filtered.length}
        onSearchChange={setSearch}
        onTypeFilterChange={setTypeFilter}
        onDateRangeChange={setDateRange}
        onExpiryFilterChange={setExpiryFilter}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
      />

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {!loading && filtered.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-2xl
              flex items-center justify-center mx-auto mb-3">
              <ClipboardList size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No entries found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(e) => e.id}
            loading={loading}
          />
        )}
      </div>

      {/* ── Product detail modal ─────────────────────────────────────────── */}
      <ProductDetailPanel
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <AddStockModal
        open={modalOpen}
        products={products}
        loading={modalLoading}
        error={modalError}
        preselectedId={selectedProduct?.id}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddStock}
      />
    </div>
  );
};

export default InventoryLog;