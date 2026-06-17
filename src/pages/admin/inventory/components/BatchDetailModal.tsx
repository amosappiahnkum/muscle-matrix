import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Layers, Calendar, User, FileText } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { getBatch } from '@/api/api';

interface BatchProductItem {
  productId:   string;
  productName: string | null;
  quantity:    number;
  unitCost:    number;
  totalCost:   number;
}

interface BatchDetail {
  id:          string;
  name:        string | null;
  batchCode:   string;
  quantity:    number;
  remaining:   number;
  totalCost:   number | null;
  expiryDate:  string | null;
  supplier:    string | null;
  note:        string | null;
  createdAt:   string | null;
  products:    BatchProductItem[];
}

interface BatchDetailModalProps {
  batchId: string | null;
  onClose: () => void;
}

const BatchDetailModal: React.FC<BatchDetailModalProps> = ({ batchId, onClose }) => {
  const [batch,   setBatch]   = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!batchId) {
      setBatch(null);
      return;
    }

    setLoading(true);
    setError('');
    getBatch(batchId)
      .then((data) => setBatch(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load batch.'))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (!batchId) return null;

  return (
    <Modal open={!!batchId} onClose={onClose} title="" maxWidth="lg">
      {loading ? (
        <div className="py-10 text-center text-gray-400 text-sm">Loading batch details...</div>
      ) : error ? (
        <div className="py-10 text-center text-red-500 text-sm">{error}</div>
      ) : batch ? (
        <div className="space-y-5">

          {/* ── Batch name first ── */}
          <div className="space-y-1">
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
              bg-blue-50 text-blue-600 border border-blue-100">
              Batch
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              {batch.name ?? 'Unnamed Batch'}
            </h2>
            <p className="font-mono text-xs text-gray-400">{batch.batchCode}</p>
          </div>

          {/* ── Summary ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">Total Quantity</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{batch.quantity}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">Remaining</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{batch.remaining}</p>
            </div>
          </div>

          {/* ── Products in this batch ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Layers size={15} className="text-gray-400" />
              Products in this batch
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs font-semibold
                text-gray-500 border-b border-gray-100">
                <span className="col-span-5">Product</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Unit Cost</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              {batch.products.length > 0 ? (
                batch.products.map((p) => (
                  <div
                    key={p.productId}
                    className="grid grid-cols-12 px-3 py-2.5 text-sm border-b
                      border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <span className="col-span-5 font-medium text-gray-800 truncate">
                      {p.productName ?? 'Product'}
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

            {batch.totalCost != null && (
              <div className="flex justify-end pt-1">
                <span className="text-sm text-gray-500 mr-2">Batch Total:</span>
                <span className="text-sm font-semibold text-gray-900">
                  GH₵{batch.totalCost.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* ── Meta ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            {batch.supplier && (
              <div className="flex items-start gap-2">
                <User size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Supplier</p>
                  <p className="text-sm font-medium text-gray-800">{batch.supplier}</p>
                </div>
              </div>
            )}
            {batch.expiryDate && (
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Expiry Date</p>
                  <p className="text-sm font-medium text-gray-800">
                    {format(parseISO(batch.expiryDate), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
            )}
            {batch.createdAt && (
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Created</p>
                  <p className="text-sm font-medium text-gray-800">
                    {format(parseISO(batch.createdAt), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
            )}
            {batch.note && (
              <div className="sm:col-span-2 flex items-start gap-2">
                <FileText size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Note</p>
                  <p className="text-sm font-medium text-gray-800">{batch.note}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : null}
    </Modal>
  );
};

export default BatchDetailModal;