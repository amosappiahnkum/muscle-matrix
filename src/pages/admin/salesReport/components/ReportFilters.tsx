import React from 'react';
import { Select, DatePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { SaleType } from '@/types';

const { RangePicker } = DatePicker;

interface ReportFiltersProps {
  dateValue:          [Dayjs, Dayjs] | null;
  filterType:         SaleType;
  onDateChange:       (v: [Dayjs, Dayjs] | null) => void;
  onFilterTypeChange: (v: SaleType) => void;
}

const SALE_TYPES = [
  { value: 'all',       label: 'All Types'  },
  { value: 'wholesale', label: 'Wholesale'  },
  { value: 'retail',    label: 'Retail'     },
];

const DATE_PRESETS = [
  { label: 'Today',        value: [dayjs().startOf('day'), dayjs().endOf('day')]                    as [Dayjs, Dayjs] },
  { label: 'Last 7 Days',  value: [dayjs().subtract(6, 'days').startOf('day'), dayjs().endOf('day')] as [Dayjs, Dayjs] },
  { label: 'Last 30 Days', value: [dayjs().subtract(29, 'days').startOf('day'), dayjs().endOf('day')] as [Dayjs, Dayjs] },
  { label: 'This Month',   value: [dayjs().startOf('month'), dayjs().endOf('month')]                 as [Dayjs, Dayjs] },
];

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  dateValue, filterType, onDateChange, onFilterTypeChange,
}) => (
  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <Select
        value={filterType}
        onChange={onFilterTypeChange}
        options={SALE_TYPES}
        style={{ width: 160 }}
      />

      <RangePicker
        value={dateValue}
        onChange={(v) => onDateChange(v as [Dayjs, Dayjs] | null)}
        presets={DATE_PRESETS}
        format="MMM DD, YYYY"
        allowClear
      />
    </div>
  </div>
);
