import React, { useState, useEffect } from 'react';
import { format, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';
import { Users } from 'lucide-react';
import { getTopCustomers, TopCustomerRow } from '@/api/api';

type Period = 'week' | 'month' | 'quarter' | 'year';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'week',    label: 'Week'    },
  { value: 'month',   label: 'Month'   },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year',    label: 'Year'    },
];

const periodStart = (p: Period): string => {
  const now = new Date();
  const d =
    p === 'week'    ? startOfWeek(now, { weekStartsOn: 1 }) :
    p === 'month'   ? startOfMonth(now) :
    p === 'quarter' ? startOfQuarter(now) :
                      startOfYear(now);
  return format(d, 'yyyy-MM-dd');
};

const TopCustomersWidget: React.FC = () => {
  const [rows,    setRows]    = useState<TopCustomerRow[]>([]);
  const [period,  setPeriod]  = useState<Period>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const from = periodStart(period);
    const to   = format(new Date(), 'yyyy-MM-dd');
    getTopCustomers(from, to, 5)
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="bg-orange-50 border border-orange-100 p-1.5 rounded-lg">
          <Users size={13} className="text-orange-500" />
        </div>
        <h4 className="text-sm font-semibold text-gray-800">Top Customers</h4>

        <div className="ml-auto flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                period === value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400">No transactions for this period</div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {rows.map((r, i) => (
            <li key={r.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
              <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm font-medium text-gray-800 capitalize truncate">{r.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{r.count} txn{r.count !== 1 ? 's' : ''}</span>
              <span className="text-sm font-semibold text-gray-900 shrink-0">GH₵{r.total.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopCustomersWidget;
