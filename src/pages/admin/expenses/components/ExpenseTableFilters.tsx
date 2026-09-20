import React from 'react';
import { Search } from 'lucide-react';
import { Select } from 'antd';
import { ExpenseMode } from './useExpenses';

const inputCls = `w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
  text-gray-900 placeholder-gray-400 text-sm
  focus:outline-none focus:bg-white focus:border-orange-400
  focus:ring-2 focus:ring-orange-100 transition-all`;

interface ExpenseTableFiltersProps {
  search:       string;
  typeFilter:   'all' | ExpenseMode;
  onSearch:     (value: string) => void;
  onTypeFilter: (value: 'all' | ExpenseMode) => void;
}

const TYPE_OPTIONS = [
  { value: 'all',             label: 'All Expenses' },
  { value: 'custom',          label: 'Custom Only'  },
  { value: 'inventory_batch', label: 'Batch Only'   },
];

const ExpenseTableFilters: React.FC<ExpenseTableFiltersProps> = ({
  search, typeFilter, onSearch, onTypeFilter,
}) => (
  <div className="flex flex-col md:flex-row gap-3 mb-4">
    <div className="relative flex-1">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search expenses..."
        className={`${inputCls} pl-9`}
      />
    </div>

    <Select
      value={typeFilter}
      onChange={onTypeFilter}
      options={TYPE_OPTIONS}
      style={{ width: 180 }}
    />
  </div>
);

export default ExpenseTableFilters;
