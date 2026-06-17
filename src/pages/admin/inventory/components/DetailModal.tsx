import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Package, Calendar, User, FileText, Hash, ArrowRight, Layers } from 'lucide-react';
import { InventoryEntry } from '@/types';
import Modal from '@/components/common/Modal';
import { TypeBadge } from './TypeBadge';
import { ChangeBadge } from './ChangeBadge';

interface BatchProductItem {
  productId:   string;
  productName: string | null;
  quantity:    number;
  unitCost:    number;
  totalCost:   number;
}

interface BatchInfo {
  id:        string;
  batchCode: string;
  name?:     string | null;
  supplier?: string | null;
  expiryDate?: string | null;
  products?: BatchProductItem[];
}

interface DetailModalProps {
  entry:   InventoryEntry | null;
  batches?: BatchInfo[];
  onClose: () => void;
}

const Row: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon, label, value,
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm text-gray-800 font-medium">{value}</div>
    </div>
  </div>
);

const DetailModal: React.FC<DetailModalProps> = ({ entry, batches = [], onClose }) => {
  const navigate = useNavigate();

  if (!entry) return null;

  const batch = entry.batchCode
    ? batches.find(b => b.batchCode === entry.batchCode)
    : undefined;

  return (
    <Modal open={!!entry} onClose={onClose} title="" maxWidth="xl">
      <div className="space-y-5">

        {/* ── Top: batch name first if available, then product ── */}
        <div className="space-y-1">
          {entry.batchCode && (
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
              {batch?.name ?? entry.batchCode}
            </p>
          )}
          <h2 className="text-xl font-bold text-gray-900">{entry.productName}</h2>
          <div className="flex items-center gap-2 pt-0.5">
            <TypeBadge type={entry.type} />
            {entry.createdBy && (
              <span className="text-xs text-gray-400">by {entry.createdBy}</span>
            )}
          </div>
        </div>

        {/* ── Stock movement ── */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">
            Stock Movement
          </p>
          <div className="flex items-center justify-between gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Before</p>
              <p className="text-2xl font-black text-gray-500 tabular-nums">
                {entry.quantityBefore}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ArrowRight size={16} className="text-gray-300" />
              <ChangeBadge change={entry.quantityChange} />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">After</p>
              <p className="text-2xl font-black text-gray-900 tabular-nums">
                {entry.quantityAfter}
              </p>
            </div>
          </div>
        </div>

        {/* ── Details ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Row
            icon={<Package size={14} />}
            label="Product"
            value={entry.productName}
          />
          {entry.batchCode && (
            <Row
              icon={<Hash size={14} />}
              label="Batch Code"
              value={
                <span className="font-mono text-blue-600">{entry.batchCode}</span>
              }
            />
          )}
          <Row
            icon={<Calendar size={14} />}
            label="Date"
            value={format(parseISO(entry.createdAt), 'dd MMM yyyy, HH:mm')}
          />
          {entry.createdBy && (
            <Row
              icon={<User size={14} />}
              label="Recorded by"
              value={entry.createdBy}
            />
          )}
          {entry.note && (
            <div className="sm:col-span-2">
              <Row
                icon={<FileText size={14} />}
                label="Note"
                value={entry.note}
              />
            </div>
          )}
        </div>

        {/* ── Products in this batch ── */}
        {batch && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Layers size={15} className="text-gray-400" />
                Products in this batch
              </div>
              <button
                onClick={() => navigate(`/admin/batches/${batch.id}`)}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                Edit batch →
              </button>
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs font-semibold
                text-gray-500 border-b border-gray-100">
                <span className="col-span-5">Product</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Unit Cost</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              {batch.products && batch.products.length > 0 ? (
                batch.products.map((p) => (
                  <div
                    key={p.productId}
                    className={`grid grid-cols-12 px-3 py-2.5 text-sm border-b
                      border-gray-50 last:border-0 transition-colors ${
                        p.productId === entry.productId ? 'bg-orange-50' : 'hover:bg-gray-50'
                      }`}
                  >
                    <span className="col-span-5 font-medium text-gray-800 truncate">
                      {p.productName ?? 'Product'}
                      {p.productId === entry.productId && (
                        <span className="ml-1.5 text-[10px] text-orange-500 font-semibold">(this)</span>
                      )}
                    </span>
                    <span className="col-span-2 text-center text-gray-600">{p.quantity}</span>
                    <span className="col-span-3 text-right text-gray-600">
                      GH₵{p.unitCost.toFixed(2)}
                    </span>
                    <span className="col-span-2 text-right font-semibold text-gray-800">
                      GH₵{p.totalCost.toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-xs text-gray-400">
                  No product breakdown available for this batch.
                </div>
              )}
            </div>

            {/* Batch meta */}
            {(batch.supplier || batch.expiryDate) && (
              <div className="flex items-center gap-4 text-xs text-gray-400 px-1">
                {batch.supplier && <span>📦 {batch.supplier}</span>}
                {batch.expiryDate && (
                  <span>⏳ Expires {format(parseISO(batch.expiryDate), 'dd MMM yyyy')}</span>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
};

export default DetailModal;