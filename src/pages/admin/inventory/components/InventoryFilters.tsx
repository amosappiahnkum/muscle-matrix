import React from 'react';
import { Search } from 'lucide-react';
import { Select, DatePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export type FilterType   = 'all' | 'restock' | 'sale' | 'adjustment';
export type ExpiryFilter = 'all' | 'expired' | 'expiringSoon' | 'valid';

interface InventoryFiltersProps {
  search:               string;
  typeFilter:           FilterType;
  expiryFilter:         ExpiryFilter;
  dateValue:            [Dayjs, Dayjs] | null;
  filteredCount:        number;
  onSearchChange:       (v: string)                  => void;
  onTypeFilterChange:   (v: FilterType)              => void;
  onDateChange:         (v: [Dayjs, Dayjs] | null)   => void;
  onExpiryFilterChange: (v: ExpiryFilter)            => void;
}

const TYPE_OPTIONS = [
  { value: 'all',        label: 'All Types'   },
  { value: 'restock',    label: 'Restocks'    },
  { value: 'sale',       label: 'Sales'       },
  { value: 'adjustment', label: 'Adjustments' },
];

const EXPIRY_OPTIONS = [
  { value: 'all',          label: 'All'           },
  { value: 'expired',      label: 'Expired'       },
  { value: 'expiringSoon', label: 'Expiring Soon' },
  { value: 'valid',        label: 'Valid'         },
];

const DATE_PRESETS = [
  { label: 'Today',        value: [dayjs().startOf('day'), dayjs().endOf('day')]                     as [Dayjs, Dayjs] },
  { label: 'This Week',    value: [dayjs().startOf('week'), dayjs().endOf('day')]                    as [Dayjs, Dayjs] },
  { label: 'Last 7 Days',  value: [dayjs().subtract(6, 'days').startOf('day'), dayjs().endOf('day')] as [Dayjs, Dayjs] },
  { label: 'Last 30 Days', value: [dayjs().subtract(29, 'days').startOf('day'), dayjs().endOf('day')] as [Dayjs, Dayjs] },
];

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  search, typeFilter, expiryFilter, dateValue, filteredCount,
  onSearchChange, onTypeFilterChange, onDateChange, onExpiryFilterChange,
}) => (
  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 space-y-3 shadow-sm">

    {/* Row 1 — type select + search */}
    <div className="flex flex-col sm:flex-row gap-3">
      <Select
        value={typeFilter}
        onChange={onTypeFilterChange}
        options={TYPE_OPTIONS}
        style={{ width: 160 }}
      />

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

    {/* Row 2 — date range + expiry + count */}
    <div className="flex flex-wrap items-center gap-3">
      <RangePicker
        value={dateValue}
        onChange={(v) => onDateChange(v as [Dayjs, Dayjs] | null)}
        presets={DATE_PRESETS}
        format="MMM DD, YYYY"
        allowClear
      />

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">Expiry:</span>
        <Select
          value={expiryFilter}
          onChange={onExpiryFilterChange}
          options={EXPIRY_OPTIONS}
          style={{ width: 140 }}
        />
      </div>

      <span className="ml-auto text-xs text-gray-400">
        {filteredCount} {filteredCount === 1 ? 'entry' : 'entries'}
      </span>
    </div>
  </div>
);
