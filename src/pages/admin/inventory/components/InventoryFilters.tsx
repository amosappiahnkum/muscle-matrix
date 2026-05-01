import React from 'react';
import { Search, Calendar } from 'lucide-react';

export type FilterType   = 'all' | 'restock' | 'sale' | 'adjustment';
export type DateRange    = 'all' | 'today' | 'week' | 'custom';
export type ExpiryFilter = 'all' | 'expired' | 'expiringSoon' | 'valid';

interface InventoryFiltersProps {
  search:        string;
  typeFilter:    FilterType;
  dateRange:     DateRange;
  expiryFilter:  ExpiryFilter;
  customFrom:    string;
  customTo:      string;
  filteredCount: number;
  onSearchChange:       (v: string)       => void;
  onTypeFilterChange:   (v: FilterType)   => void;
  onDateRangeChange:    (v: DateRange)    => void;
  onExpiryFilterChange: (v: ExpiryFilter) => void;
  onCustomFromChange:   (v: string)       => void;
  onCustomToChange:     (v: string)       => void;
}

const filterBtnCls = (active: boolean, activeColor = '') =>
  `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
  ${active
    ? activeColor || 'bg-white text-gray-900 shadow-sm border border-gray-200'
    : 'text-gray-500 hover:text-gray-700'
  }`;

const TYPE_BUTTONS: { label: string; value: FilterType }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Restocks',    value: 'restock' },
  { label: 'Sales',       value: 'sale' },
  { label: 'Adjustments', value: 'adjustment' },
];

const DATE_BUTTONS: { label: string; value: DateRange }[] = [
  { label: 'All time',  value: 'all' },
  { label: 'Today',     value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'Custom',    value: 'custom' },
];

const EXPIRY_BUTTONS: { label: string; value: ExpiryFilter; activeColor: string }[] = [
  { label: 'All',           value: 'all',          activeColor: '' },
  { label: 'Expired',       value: 'expired',      activeColor: 'bg-red-50 text-red-600 border border-red-200' },
  { label: 'Expiring Soon', value: 'expiringSoon', activeColor: 'bg-amber-50 text-amber-600 border border-amber-200' },
  { label: 'Valid',         value: 'valid',        activeColor: 'bg-green-50 text-green-600 border border-green-200' },
];

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  search, typeFilter, dateRange, expiryFilter,
  customFrom, customTo, filteredCount,
  onSearchChange, onTypeFilterChange, onDateRangeChange,
  onExpiryFilterChange, onCustomFromChange, onCustomToChange,
}) => (
  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 space-y-3 shadow-sm">

    {/* Type + Search */}
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TYPE_BUTTONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onTypeFilterChange(value)}
            className={filterBtnCls(typeFilter === value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search product or note…"
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl
            text-gray-900 placeholder-gray-400 text-sm focus:outline-none
            focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>
    </div>

    {/* Date + Expiry row */}
    <div className="flex flex-wrap items-center gap-3">

      {/* Date range */}
      <div className="flex items-center gap-2">
        <Calendar size={13} className="text-gray-400" />
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {DATE_BUTTONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onDateRangeChange(value)}
              className={filterBtnCls(dateRange === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date inputs */}
      {dateRange === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onCustomFromChange(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700
              focus:outline-none focus:border-blue-400 transition-all"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onCustomToChange(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700
              focus:outline-none focus:border-blue-400 transition-all"
          />
        </div>
      )}

      {/* Expiry filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">Expiry:</span>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {EXPIRY_BUTTONS.map(({ label, value, activeColor }) => (
            <button
              key={value}
              onClick={() => onExpiryFilterChange(value)}
              className={filterBtnCls(expiryFilter === value, activeColor)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Entry count */}
      <span className="ml-auto text-xs text-gray-400">
        {filteredCount} {filteredCount === 1 ? 'entry' : 'entries'}
      </span>
    </div>
  </div>
);