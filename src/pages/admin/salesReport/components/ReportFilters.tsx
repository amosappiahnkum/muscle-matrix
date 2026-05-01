import React from 'react';
import { Calendar } from 'lucide-react';
import { DateRange, SaleType } from '@/types';

interface ReportFiltersProps {
  dateRange:  DateRange;
  startDate:  string;
  endDate:    string;
  filterType: SaleType;
  onDateRangeChange:  (v: DateRange) => void;
  onStartDateChange:  (v: string)    => void;
  onEndDateChange:    (v: string)    => void;
  onFilterTypeChange: (v: SaleType)  => void;
}

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: 'today',  label: 'Today'       },
  { value: 'week',   label: 'Last 7 Days' },
  { value: 'month',  label: 'Last 30 Days'},
  { value: 'all',    label: 'All Time'    },
  { value: 'custom', label: 'Custom'      },
];

const SALE_TYPES: { value: SaleType; label: string; activeClass: string }[] = [
  { value: 'all',       label: 'All Types',  activeClass: 'bg-gray-800 text-white border-gray-800'    },
  { value: 'wholesale', label: 'Wholesale',  activeClass: 'bg-blue-600 text-white border-blue-600'    },
  { value: 'retail',    label: 'Retail',     activeClass: 'bg-green-600 text-white border-green-600'  },
];

const pillBtn = (active: boolean, activeColor = '') =>
  `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
    active
      ? activeColor || 'bg-white text-gray-900 shadow-sm border border-gray-200'
      : 'text-gray-500 hover:text-gray-700'
  }`;

const inputCls = 'px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all';

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  dateRange, startDate, endDate, filterType,
  onDateRangeChange, onStartDateChange, onEndDateChange, onFilterTypeChange,
}) => (
  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm space-y-2.5">

    {/* Row 1 — type filter + date pills */}
    <div className="flex flex-col sm:flex-row gap-2.5">

      {/* Type filter pill group */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {SALE_TYPES.map(({ value, label, activeClass }) => (
          <button
            key={value}
            onClick={() => onFilterTypeChange(value)}
            className={pillBtn(filterType === value, activeClass)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    {/* Row 2 — date range + optional custom inputs + type label */}
    <div className="flex flex-wrap items-center gap-3">

      {/* Date range */}
      <div className="flex items-center gap-2">
        <Calendar size={13} className="text-gray-400" />
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {DATE_RANGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onDateRangeChange(value)}
              className={pillBtn(dateRange === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date inputs */}
      {dateRange === 'custom' && (
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} className={inputCls} />
          <span className="text-gray-400 text-xs">to</span>
          <input type="date" value={endDate}   onChange={(e) => onEndDateChange(e.target.value)}   className={inputCls} />
        </div>
      )}
    </div>
  </div>
);