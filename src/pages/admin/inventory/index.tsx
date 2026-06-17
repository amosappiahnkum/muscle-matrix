import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Minus, Plus, RotateCcw, Eye } from 'lucide-react';
import { format, isToday, isThisWeek, parseISO } from 'date-fns';
import { getProducts, getInventoryLog, adjustStock, getBatches } from '@/api/api.ts';
import { Product, InventoryEntry } from '@/types';
import DataTable, { Column } from '@/components/common/DataTable.tsx';
import Button from '@/components/common/Button.tsx';
import { SuccessBanner } from '@/components/common/Banner.tsx';

import { ChangeBadge }    from './components/ChangeBadge';
import { TypeBadge }      from './components/TypeBadge';
import { RemoveStockModal } from './components/RemoveStockModal';
import DetailModal from './components/DetailModal';
import {
  InventoryFilters,
  FilterType, DateRange, ExpiryFilter,
} from './components/InventoryFilters';

interface Batch {
  id:               string;
  batchCode:        string;
  name?:            string | null;
  productId?:       string;
  quantity?:        number;
  remaining?:       number;
  expiryDate?:      string;
  supplier?:        string;
  batchDescription?: string;
  products?: {
    productId:   string;
    productName: string | null;
    quantity:    number;
    unitCost:    number;
    totalCost:   number;
  }[];
}

const InventoryLog: React.FC = () => {
  const navigate = useNavigate();

  const [entries,          setEntries]          = useState<InventoryEntry[]>([]);
  const [products,         setProducts]         = useState<Product[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [search,           setSearch]           = useState('');
  const [typeFilter,       setTypeFilter]       = useState<FilterType>('all');
  const [dateRange,        setDateRange]        = useState<DateRange>('all');
  const [expiryFilter,     setExpiryFilter]     = useState<ExpiryFilter>('all');
  const [selectedBatchCode,setSelectedBatchCode]= useState<string>('all');
  const [customFrom,       setCustomFrom]       = useState('');
  const [customTo,         setCustomTo]         = useState('');
  const [selectedProduct,  setSelectedProduct]  = useState<Product | null>(null);
  const [viewingEntry,     setViewingEntry]     = useState<InventoryEntry | null>(null);
  const [removeOpen,       setRemoveOpen]       = useState(false);
  const [removeLoading,    setRemoveLoading]    = useState(false);
  const [removeError,      setRemoveError]      = useState('');
  const [success,          setSuccess]          = useState('');
  const [batches,          setBatches]          = useState<Batch[]>([]);

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [log, prods, batchRows] = await Promise.all([
        getInventoryLog(),
        getProducts(),
        getBatches(),
      ]);
      setEntries(log);
      setProducts(prods);
      setBatches(batchRows);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRemoveStock = async (productId: string, quantity: number, note: string) => {
    setRemoveError('');
    if (!productId)              { setRemoveError('Please select a product.'); return; }
    if (!quantity || quantity < 1) { setRemoveError('Quantity must be at least 1.'); return; }

    const product = products.find((p) => p.id === productId);
    if (!product)                { setRemoveError('Selected product was not found.'); return; }
    if (quantity > product.quantity) {
      setRemoveError(`Cannot remove more than current stock (${product.quantity}).`); return;
    }

    setRemoveLoading(true);
    try {
      await adjustStock({ productId, quantity: -quantity, note: note || 'Removed from inventory' });
      flash('Stock removed successfully.');
      setRemoveOpen(false);
      await load();
    } catch (err: unknown) {
      setRemoveError(err instanceof Error ? err.message : 'Failed to remove stock.');
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleProductClick = (entry: InventoryEntry) => {
    const product = products.find((p) => p.id === entry.productId);
    if (!product) return;
    setSelectedProduct((prev) => prev?.id === product.id ? null : product);
  };

  // ── Filters ───────────────────────────────────────────────────────────────
  const filtered = entries.filter((e) => {
    if (selectedProduct && e.productId !== selectedProduct.id) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter)         return false;
    if (selectedBatchCode !== 'all' && e.batchCode !== selectedBatchCode) return false;

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
      key: 'productName',
      header: 'Product',
      render: (e) => (
        <div className="text-left group">
          {e.batchCode && (
            <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-0.5">
              {batches.find(b => b.batchCode === e.batchCode)?.name ?? e.batchCode}
            </p>
          )}
          <button
            onClick={() => navigate(`/admin/products/${e.productId}`)}
            className="text-sm font-semibold text-gray-800 hover:text-blue-600 hover:underline
              transition-colors text-left"
            title="View / edit product"
          >
            {e.productName}
          </button>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={() => handleProductClick(e)}
              className="text-[10px] text-gray-400 hover:text-orange-500 transition-colors"
              title="Filter inventory log by this product"
            >
              {selectedProduct?.id === e.productId ? 'Clear filter' : 'Filter by this product'}
            </button>
          </div>
          {e.createdBy && (
            <p className="text-gray-400 text-xs mt-0.5">by {e.createdBy}</p>
          )}
        </div>
      ),
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
      key: 'batch',
      header: 'Batch',
      align: 'center',
      render: (e) => {
        const batch = batches.find(b => b.batchCode === e.batchCode);
        return e.batchCode ? (
          <button
            onClick={() => batch && navigate(`/admin/batches/${batch.id}`)}
            className="text-center group cursor-pointer"
            title="View batch details"
          >
            {batch?.name && (
              <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-600">
                {batch.name}
              </p>
            )}
            <p className="font-mono text-[10px] text-blue-500">{e.batchCode}</p>
          </button>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        );
      },
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
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (e) => (
        <button
          onClick={() => setViewingEntry(e)}
          title="View details"
          className="p-1.5 bg-blue-50 text-blue-500 rounded-lg border border-blue-100
            hover:bg-blue-100 transition-colors"
        >
          <Eye size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
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
            variant="ghost"
            color="red"
            icon={<Minus size={16} />}
            onClick={() => { setRemoveError(''); setRemoveOpen(true); }}
          >
            Remove Stock
          </Button>
          <Button
            variant="primary"
            color="orange"
            icon={<Plus size={16} />}
            onClick={() => navigate(
              selectedProduct
                ? `/admin/inventory/add-stock?productId=${selectedProduct.id}`
                : '/admin/inventory/add-stock'
            )}
          >
            Add Stock
          </Button>
        </div>
      </div>

      {success && <SuccessBanner message={success} onDismiss={() => setSuccess('')} />}

      {/* Filters */}
      <div className="space-y-3">
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

        <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm max-w-xs">
          <label htmlFor="batchSelect" className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
            Filter By Batch:
          </label>
          <select
            id="batchSelect"
            value={selectedBatchCode}
            onChange={(e) => setSelectedBatchCode(e.target.value)}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Batches</option>
            {Array.from(new Set(entries.map((e) => e.batchCode).filter(Boolean))).map((code) => {
              const batch = batches.find(b => b.batchCode === code);
              return (
                <option key={code} value={code}>
                  {batch?.name ? `${batch.name} (${code})` : code}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-gray-400 text-sm">Loading inventory...</div>
        ) : filtered?.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ClipboardList size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No entries found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your filters or selecting a different batch.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filtered} keyExtractor={(e) => e.id} loading={loading} />
        )}
      </div>

      {/* Entry view modal */}
      <DetailModal
        entry={viewingEntry}
        batches={batches}
        onClose={() => setViewingEntry(null)}
      />

      <RemoveStockModal
        open={removeOpen}
        products={products}
        loading={removeLoading}
        error={removeError}
        preselectedId={selectedProduct?.id}
        onClose={() => setRemoveOpen(false)}
        onSubmit={handleRemoveStock}
      />
    </div>
  );
};

export default InventoryLog;