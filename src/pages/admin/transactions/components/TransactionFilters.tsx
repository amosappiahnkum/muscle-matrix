import React from 'react';
import { Search } from 'lucide-react';

export type SaleType = 'all' | 'wholesale' | 'retail';

interface TransactionFiltersProps {
  searchQuery:    string;
  typeFilter:     SaleType;
  filteredCount:  number;
  onSearchChange: (v: string)   => void;
  onTypeChange:   (v: SaleType) => void;
}

const TYPE_FILTERS: { value: SaleType; label: string }[] = [
  { value: 'all',       label: 'All'       },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'retail',    label: 'Retail'    },
];

const pillBtn = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
    active
      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
      : 'text-gray-500 hover:text-gray-700'
  }`;

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery, typeFilter, filteredCount, onSearchChange, onTypeChange,
}) => (
  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm space-y-2.5">

    {/* Row 1 — type pills + search */}
    <div className="flex flex-col sm:flex-row gap-2.5">

      {/* Type pill group */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TYPE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onTypeChange(value)}
            className={pillBtn(typeFilter === value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search receipt, customer or employee…"
          className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl
            text-gray-900 placeholder-gray-400 text-sm focus:outline-none
            focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all"
        />
      </div>
    </div>

    {/* Row 2 — entry count */}
    <div className="flex justify-end">
      <span className="text-xs text-gray-400">
        {filteredCount} {filteredCount === 1 ? 'transaction' : 'transactions'}
      </span>
    </div>
  </div>
);

export default TransactionFilters;