import React from 'react';
import { format, parseISO } from 'date-fns';
import { FileText, Layers, Truck, ShoppingCart, Package, Calendar, User, Tag as TagIcon } from 'lucide-react';
import { Divider, Tag, Typography } from 'antd';
import { Expense } from '@/types';
import Modal from '@/components/common/Modal';

const { Text, Title } = Typography;

interface ExpenseViewModalProps {
  expense: Expense | null;
  onClose: () => void;
}

// ── Shared aside meta row ─────────────────────────────────
const MetaRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon, label, value,
}) => (
  <div className="flex items-start gap-2.5">
    <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>
    <div>
      <Text className="text-[11px] text-gray-400 block">{label}</Text>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  </div>
);

// ── Batch aside ───────────────────────────────────────────
const BatchAside: React.FC<{ expense: Expense }> = ({ expense }) => {
  const batch           = expense.batch!;
  const productsTotal   = batch.totalCost      ?? 0;
  const purchasingTotal = batch.purchasingTotal ?? 0;
  const grandTotal      = batch.grandTotal      ?? expense.amount;

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* Title */}
      <div>
        <Tag color="blue" className="mb-2 text-[11px]">Batch</Tag>
        <Title level={5} style={{ margin: 0, color: '#111827', lineHeight: 1.35 }}>
          {batch.name ?? 'Unnamed Batch'}
        </Title>
        {expense.description && (
          <Text type="secondary" className="text-xs mt-1 block leading-relaxed">
            {expense.description}
          </Text>
        )}
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Cost breakdown card */}
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <ShoppingCart size={12} />
            Products
          </div>
          <Text className="text-sm font-semibold text-gray-800 tabular-nums">
            GH₵{productsTotal.toFixed(2)}
          </Text>
        </div>

        {purchasingTotal > 0 && (
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Truck size={12} />
              On-the-way
            </div>
            <Text className="text-sm font-semibold text-gray-800 tabular-nums">
              + GH₵{purchasingTotal.toFixed(2)}
            </Text>
          </div>
        )}

        <div className="flex items-center justify-between px-3.5 py-3 bg-gray-50">
          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Grand Total
          </Text>
          <Text strong className="text-xl text-orange-500 tabular-nums">
            GH₵{grandTotal.toFixed(2)}
          </Text>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-3.5">
        {batch.supplier && (
          <MetaRow icon={<Truck size={13} />} label="Supplier" value={batch.supplier} />
        )}
        {expense.category && (
          <MetaRow icon={<TagIcon size={13} />} label="Category" value={expense.category} />
        )}
        <MetaRow
          icon={<Calendar size={13} />}
          label="Date"
          value={format(parseISO(expense.createdAt), 'dd MMM yyyy, HH:mm')}
        />
        {expense.createdBy && (
          <MetaRow icon={<User size={13} />} label="Recorded by" value={expense.createdBy} />
        )}
      </div>
    </div>
  );
};

// ── Custom expense aside ──────────────────────────────────
const CustomAside: React.FC<{ expense: Expense }> = ({ expense }) => (
  <div className="flex flex-col gap-5 h-full">

    <div>
      <Tag color="default" className="mb-2 text-[11px]">Custom</Tag>
      <Title level={5} style={{ margin: 0, color: '#111827', lineHeight: 1.35 }}>
        {expense.description ?? 'Expense'}
      </Title>
    </div>

    <Divider style={{ margin: 0 }} />

    {/* Amount card */}
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3.5">
      <Text className="text-xs text-gray-400 block mb-1">Amount</Text>
      <Text strong className="text-2xl text-gray-900 tabular-nums">
        GH₵{expense.amount.toFixed(2)}
      </Text>
    </div>

    {/* Meta */}
    <div className="flex flex-col gap-3.5">
      {expense.category && (
        <MetaRow icon={<TagIcon size={13} />} label="Category" value={expense.category} />
      )}
      <MetaRow
        icon={<Calendar size={13} />}
        label="Date"
        value={format(parseISO(expense.createdAt), 'dd MMM yyyy, HH:mm')}
      />
      {expense.createdBy && (
        <MetaRow icon={<User size={13} />} label="Recorded by" value={expense.createdBy} />
      )}
    </div>
  </div>
);

// ── Main modal ────────────────────────────────────────────
const ExpenseViewModal: React.FC<ExpenseViewModalProps> = ({ expense, onClose }) => {
  if (!expense) return null;

  const isBatch         = expense.type === 'inventory_batch';
  const batch           = expense.batch;
  const purchasingCosts = batch?.purchasingCosts ?? [];
  const purchasingTotal = batch?.purchasingTotal  ?? 0;
  const productsTotal   = batch?.totalCost        ?? 0;

  return (
    <Modal
      open={!!expense}
      onClose={onClose}
      title=""
      maxWidth="4xl"
      aside={
        isBatch && batch
          ? <BatchAside expense={expense} />
          : <CustomAside expense={expense} />
      }
    >
      <div className="flex flex-col gap-5">

        {/* Products table (batch only) */}
        {isBatch && batch && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Layers size={15} className="text-gray-400" />
              Products
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
                    <span className="col-span-2 text-right font-semibold text-gray-800 tabular-nums">
                      GH₵{p.totalCost.toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-12 px-3 py-2.5 text-sm">
                  <span className="col-span-5 font-medium text-gray-800 truncate">
                    {batch.productName ?? expense.productName ?? 'Product'}
                  </span>
                  <span className="col-span-2 text-center text-gray-600">{batch.quantity ?? '—'}</span>
                  <span className="col-span-3 text-right text-gray-600">
                    {batch.unitCost != null ? `GH₵${batch.unitCost.toFixed(2)}` : '—'}
                  </span>
                  <span className="col-span-2 text-right font-semibold text-gray-800 tabular-nums">
                    {batch.totalCost != null ? `GH₵${batch.totalCost.toFixed(2)}` : '—'}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-12 px-3 py-2 bg-gray-50 border-t border-gray-100">
                <span className="col-span-10 text-xs font-semibold text-gray-500 text-right pr-2">
                  Subtotal
                </span>
                <span className="col-span-2 text-right text-sm font-bold text-gray-800 tabular-nums">
                  GH₵{productsTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* On-the-way costs table */}
        {isBatch && purchasingCosts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Truck size={15} className="text-gray-400" />
              On-the-way costs
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs font-semibold
                text-gray-500 border-b border-gray-100">
                <span className="col-span-4">Category</span>
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>

              {purchasingCosts.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-12 px-3 py-2.5 text-sm border-b
                    border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <span className="col-span-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full
                      text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100">
                      {c.category}
                    </span>
                  </span>
                  <span className="col-span-6 text-gray-600 truncate">
                    {c.description ?? '—'}
                  </span>
                  <span className="col-span-2 text-right font-semibold text-gray-800 tabular-nums">
                    GH₵{c.amount.toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="grid grid-cols-12 px-3 py-2 bg-gray-50 border-t border-gray-100">
                <span className="col-span-10 text-xs font-semibold text-gray-500 text-right pr-2">
                  Subtotal
                </span>
                <span className="col-span-2 text-right text-sm font-bold text-gray-800 tabular-nums">
                  GH₵{purchasingTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Custom — no table, empty state */}
        {!isBatch && !expense.note && (
          <div className="py-10 text-center">
            <Package size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No additional details recorded.</p>
          </div>
        )}

        {/* Note */}
        {expense.note && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1.5">
              <FileText size={12} />
              Note
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{expense.note}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExpenseViewModal;