import React from 'react';
import { Search } from 'lucide-react';
import { ExpenseMode } from './useExpenses';

const inputCls = `w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
  text-gray-900 placeholder-gray-400 text-sm
  focus:outline-none focus:bg-white focus:border-orange-400
  focus:ring-2 focus:ring-orange-100 transition-all`;

interface ExpenseTableFiltersProps {
  search:      string;
  typeFilter:  'all' | ExpenseMode;
  onSearch:    (value: string) => void;
  onTypeFilter: (value: 'all' | ExpenseMode) => void;
}

const ExpenseTableFilters: React.FC<ExpenseTableFiltersProps> = ({
  search,
  typeFilter,
  onSearch,
  onTypeFilter,
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

    <select
      value={typeFilter}
      onChange={(e) => onTypeFilter(e.target.value as 'all' | ExpenseMode)}
      className={`${inputCls} md:w-56`}
    >
      <option value="all">All expenses</option>
      <option value="custom">Custom only</option>
      <option value="inventory_batch">Batch only</option>
    </select>
  </div>
);

export default ExpenseTableFilters;