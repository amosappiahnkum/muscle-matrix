import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
}

const TopCustomers: React.FC<Props> = ({ transactions }) => {
  const rows = useMemo(() => {
    const stats = new Map<string, { name: string; total: number; count: number }>();
    for (const t of transactions) {
      const key = t.customerName.trim().toLowerCase();
      const cur = stats.get(key) ?? { name: t.customerName.trim(), total: 0, count: 0 };
      stats.set(key, { ...cur, total: cur.total + t.totalAmount, count: cur.count + 1 });
    }
    return [...stats.values()]
      .sort((a, b) => b.total - a.total)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [transactions]);

  if (rows.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Users size={14} className="text-orange-500" />
        <h4 className="text-sm font-semibold text-gray-800">Top Customers</h4>
        <span className="ml-auto text-xs text-gray-400">{rows.length} unique</span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
            <th className="px-4 py-2 text-left w-8">#</th>
            <th className="px-4 py-2 text-left">Customer</th>
            <th className="px-4 py-2 text-center">Txns</th>
            <th className="px-4 py-2 text-right">Total Spent</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2.5 text-xs font-bold text-gray-400">{r.rank}</td>
              <td className="px-4 py-2.5 font-medium text-gray-800 capitalize">{r.name}</td>
              <td className="px-4 py-2.5 text-center text-gray-500">{r.count}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                GH₵{r.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopCustomers;
