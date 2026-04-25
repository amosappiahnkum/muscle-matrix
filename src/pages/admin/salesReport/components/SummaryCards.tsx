import React from 'react';
import { DollarSign, Store, ShoppingBag, TrendingUp } from 'lucide-react';
import { ReportSummary, SaleType } from '@/types';

interface SummaryCardsProps {
  report:     ReportSummary;
  rangeLabel: string;
  filterType: SaleType;
}

const CARDS = [
  {
    key:        'total',
    label:      'Total Revenue',
    valueKey:   'totalSales'     as keyof ReportSummary,
    countKey:   'transactionCount' as keyof ReportSummary,
    icon:       DollarSign,
    accent:     'text-violet-600',
    bg:         'bg-violet-50',
    border:     'border-violet-100',
    iconBg:     'bg-violet-100',
  },
  {
    key:        'wholesale',
    label:      'Wholesale Sales',
    valueKey:   'wholesaleTotal'  as keyof ReportSummary,
    countKey:   'wholesaleCount'  as keyof ReportSummary,
    icon:       Store,
    accent:     'text-blue-600',
    bg:         'bg-blue-50',
    border:     'border-blue-100',
    iconBg:     'bg-blue-100',
  },
  {
    key:        'retail',
    label:      'Retail Sales',
    valueKey:   'retailTotal'     as keyof ReportSummary,
    countKey:   'retailCount'     as keyof ReportSummary,
    icon:       ShoppingBag,
    accent:     'text-green-600',
    bg:         'bg-green-50',
    border:     'border-green-100',
    iconBg:     'bg-green-100',
  },
];

export const SummaryCards: React.FC<SummaryCardsProps> = ({ report, rangeLabel, filterType }) => (
  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">

    {/* Header */}
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">{rangeLabel}</p>
        {filterType !== 'all' && (
          <p className="text-xs text-gray-400 mt-0.5">
            Showing <span className="capitalize font-medium text-orange-500">{filterType} sales</span> only
          </p>
        )}
      </div>
      <TrendingUp size={16} className="text-orange-400" />
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {CARDS.map(({ key, label, valueKey, countKey, icon: Icon, accent, bg, border, iconBg }) => (
        <div key={key} className={`${bg} border ${border} rounded-xl px-3 py-2.5 flex items-center justify-between`}>
          <div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`text-base font-bold mt-0.5 ${accent}`}>
              GH₵{(report[valueKey] as number).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {report[countKey] as number} txn(s)
            </p>
          </div>
          <div className={`${iconBg} p-2 rounded-lg`}>
            <Icon size={15} className={accent} />
          </div>
        </div>
      ))}
    </div>

    {/* Distribution bar */}
    {report.totalSales > 0 && (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-medium mb-1.5">Sales Distribution</p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="bg-blue-500 h-full transition-all duration-500"
            style={{ width: `${(report.wholesaleTotal / report.totalSales) * 100}%` }}
          />
          <div
            className="bg-green-500 h-full transition-all duration-500"
            style={{ width: `${(report.retailTotal / report.totalSales) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-blue-600 font-medium">
            Wholesale {((report.wholesaleTotal / report.totalSales) * 100).toFixed(1)}%
          </span>
          <span className="text-xs text-green-600 font-medium">
            Retail {((report.retailTotal / report.totalSales) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    )}
  </div>
);