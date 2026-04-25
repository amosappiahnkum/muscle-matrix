import React from 'react';
import { InventoryEntry } from '@/types';

export const TypeBadge: React.FC<{ type: InventoryEntry['type'] }> = ({ type }) => {
  const styles: Record<InventoryEntry['type'], string> = {
    restock:    'bg-blue-50 text-blue-700 border border-blue-200',
    sale:       'bg-orange-50 text-orange-700 border border-orange-200',
    adjustment: 'bg-purple-50 text-purple-700 border border-purple-200',
    initial:    'bg-gray-50 text-gray-600 border border-gray-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[type]}`}>
      {type}
    </span>
  );
};