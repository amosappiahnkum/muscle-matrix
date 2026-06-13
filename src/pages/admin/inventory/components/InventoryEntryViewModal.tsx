import React from 'react';
import { format, parseISO } from 'date-fns';
import { Package, Calendar, User, FileText, Hash, ArrowRight } from 'lucide-react';
import { InventoryEntry } from '@/types';
import Modal from '@/components/common/Modal';
import { TypeBadge } from './TypeBadge';
import { ChangeBadge } from './ChangeBadge';

interface InventoryEntryViewModalProps {
  entry:   InventoryEntry | null;
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

const InventoryEntryViewModal: React.FC<InventoryEntryViewModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  return (
    <Modal open={!!entry} onClose={onClose} title="" maxWidth="md">
      <div className="space-y-5">

        {/* ── Top: batch name first if available, then product ── */}
        <div className="space-y-1">
          {entry.batchCode && (
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
              {entry.batchCode}
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

      </div>
    </Modal>
  );
};

export default InventoryEntryViewModal;