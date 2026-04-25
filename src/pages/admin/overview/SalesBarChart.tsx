import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { getDailySalesReport } from '@/api/api.ts';
import { BarChart2 } from 'lucide-react';

interface DayData {
  day:          string;
  sales:        number;
  transactions: number;
  date:         string;
}

interface CustomTooltipProps {
  active?:  boolean;
  payload?: { value: number }[];
  label?:   string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-blue-600">
        GH₵{payload[0].value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

const SalesBarChart: React.FC = () => {
  const [data,        setData]        = useState<DayData[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
        const reports = await Promise.all(
          days.map((d) => getDailySalesReport(format(d, 'yyyy-MM-dd')))
        );
        setData(days.map((d, i) => ({
          day:          format(d, 'EEE'),
          date:         format(d, 'MMM d'),
          sales:        reports[i]?.totalSales ?? 0,
          transactions: reports[i]?.transactionCount ?? 0,
        })));
      } catch (err) {
        console.error('Failed to load weekly sales:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalWeek = data.reduce((s, d) => s + d.sales, 0);
  const peakDay   = data.reduce(
    (best, d) => (d.sales > best.sales ? d : best),
    data[0] ?? { day: '—', sales: 0 }
  );
  const peakIdx = data.findIndex((d) => d === peakDay);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-1.5 rounded-lg">
            <BarChart2 size={14} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Weekly Sales</p>
            <p className="text-xs text-gray-400">Last 7 days</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 text-right">
            <p className="text-[10px] text-gray-400 leading-none mb-0.5">Total</p>
            <p className="text-xs font-bold text-gray-800 tabular-nums">
              GH₵{totalWeek.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 text-right">
            <p className="text-[10px] text-blue-400 leading-none mb-0.5">Peak</p>
            <p className="text-xs font-bold text-blue-700">{peakDay?.day ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-36 text-gray-300 text-xs gap-2">
          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading…
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={data}
              margin={{ top: 2, right: 2, left: 0, bottom: 0 }}
              barCategoryGap="32%"
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Bar
                dataKey="sales"
                radius={[4, 4, 0, 0]}
                onMouseEnter={(_, i) => setActiveIndex(i)}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      activeIndex === i ? '#1d4ed8' :
                      i === peakIdx   ? '#3b82f6' : '#bfdbfe'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Date labels */}
          <div className="grid grid-cols-7 mt-1 text-center">
            {data.map((d) => (
              <p key={d.date} className="text-[10px] text-gray-300">{d.date}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SalesBarChart;