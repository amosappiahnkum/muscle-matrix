import React, { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types';
import { getTransactions } from '@/api/api.ts';
import { format, subDays, parseISO } from 'date-fns';
import {
  Calendar, DollarSign, ShoppingCart, Store,
  ShoppingBag, Printer, FileDown, TrendingUp, Receipt, Filter,
} from 'lucide-react';
import Button from '../common/Button';
import DataTable, { Column } from '../common/DataTable';
import { ErrorBanner } from '../common/Banner';

// ─── Constants ────────────────────────────────────────────────────────────────
const BUSINESS_NAME  = 'MUSCLE MATRIX';
const BUSINESS_PHONE = '0245349937';
const BUSINESS_EMAIL = 'emmanueleshun558@gmail.com';

type DateRange  = 'today' | 'week' | 'month' | 'all' | 'custom';
type SaleType   = 'all' | 'wholesale' | 'retail';

interface ReportSummary {
  wholesaleTotal:   number;
  retailTotal:      number;
  totalSales:       number;
  transactionCount: number;
  wholesaleCount:   number;
  retailCount:      number;
}

const emptyReport: ReportSummary = {
  wholesaleTotal: 0, retailTotal: 0, totalSales: 0,
  transactionCount: 0, wholesaleCount: 0, retailCount: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getDateRangeLabel = (
    dateRange: DateRange, startDate: string, endDate: string
): string => {
  switch (dateRange) {
    case 'today':  return `Today — ${format(new Date(), 'MMMM dd, yyyy')}`;
    case 'week':   return `Last 7 Days (${format(subDays(new Date(), 7), 'MMM dd')} – ${format(new Date(), 'MMM dd, yyyy')})`;
    case 'month':  return `Last 30 Days (${format(subDays(new Date(), 30), 'MMM dd')} – ${format(new Date(), 'MMM dd, yyyy')})`;
    case 'all':    return 'All Time Report';
    case 'custom': return `${startDate} to ${endDate}`;
    default:       return '';
  }
};

const buildSummary = (transactions: Transaction[]): ReportSummary => {
  const ws = transactions.filter((t) => t.type === 'wholesale');
  const rt = transactions.filter((t) => t.type === 'retail');
  const wholesaleTotal = ws.reduce((s, t) => s + t.totalAmount, 0);
  const retailTotal    = rt.reduce((s, t) => s + t.totalAmount, 0);
  return {
    wholesaleTotal,
    retailTotal,
    totalSales:       wholesaleTotal + retailTotal,
    transactionCount: transactions.length,
    wholesaleCount:   ws.length,
    retailCount:      rt.length,
  };
};

// ─── Print HTML builder ───────────────────────────────────────────────────────
const buildPrintHTML = (
    transactions: Transaction[],
    report: ReportSummary,
    rangeLabel: string,
    typeLabel: string,
): string => {
  const rows = transactions.map((t, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td>${i + 1}</td>
      <td class="mono">${t.receiptNumber}</td>
      <td>${t.customerName}</td>
      <td class="badge-${t.type}">${t.type.toUpperCase()}</td>
      <td>${t.employeeName}</td>
      <td>${t.items.map((item) => `${item.productName} ×${item.quantity}`).join(', ')}</td>
      <td class="amount">GH₵${t.totalAmount.toFixed(2)}</td>
      <td>${format(parseISO(t.createdAt), 'MMM dd, yyyy HH:mm')}</td>
    </tr>
  `).join('');

  const wsPct = report.totalSales > 0 ? ((report.wholesaleTotal / report.totalSales) * 100).toFixed(1) : '0.0';
  const rtPct = report.totalSales > 0 ? ((report.retailTotal    / report.totalSales) * 100).toFixed(1) : '0.0';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${BUSINESS_NAME} — Sales Report</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:12px;color:#111;padding:20px}
    .header{text-align:center;border-bottom:3px solid #ea580c;padding-bottom:16px;margin-bottom:20px}
    .business-name{font-size:28px;font-weight:900;letter-spacing:4px;color:#ea580c}
    .business-sub{font-size:12px;color:#555;margin-top:4px}
    .contact-bar{margin-top:6px;font-size:11px;color:#444}
    .report-title{font-size:16px;font-weight:700;margin-top:12px;color:#1a1a1a}
    .report-period{font-size:12px;color:#555;margin-top:3px}
    .print-date{font-size:10px;color:#888;margin-top:3px}
    .summary{display:flex;gap:16px;margin-bottom:20px}
    .card{flex:1;border:1px solid #ddd;border-radius:8px;padding:12px;text-align:center}
    .card-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;margin-bottom:4px}
    .card-value{font-size:22px;font-weight:900}
    .card-sub{font-size:10px;color:#888;margin-top:2px}
    .card-total .card-value{color:#7c3aed}
    .card-wholesale .card-value{color:#2563eb}
    .card-retail .card-value{color:#16a34a}
    .dist-section{margin-bottom:20px}
    .dist-label{font-size:10px;color:#666;margin-bottom:4px}
    .dist-bar{height:10px;background:#e5e7eb;border-radius:9999px;overflow:hidden;display:flex}
    .dist-ws{background:#3b82f6;height:100%}
    .dist-rt{background:#22c55e;height:100%}
    .dist-legend{display:flex;justify-content:space-between;margin-top:4px;font-size:10px}
    .dist-ws-text{color:#2563eb}
    .dist-rt-text{color:#16a34a}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:11px}
    th{background:#ea580c;color:#fff;padding:8px 6px;text-align:left}
    td{padding:6px;border-bottom:1px solid #e5e7eb}
    .row-even{background:#fff}
    .row-odd{background:#fef3e2}
    .mono{font-family:monospace;font-size:10px}
    .amount{font-weight:700;color:#ea580c;text-align:right}
    td:last-child{font-size:10px;color:#555}
    .badge-wholesale{color:#2563eb;font-weight:700;font-size:10px}
    .badge-retail{color:#16a34a;font-weight:700;font-size:10px}
    .totals-row td{background:#1a1a1a;color:#fff;font-weight:700;padding:8px 6px;font-size:12px}
    .totals-row .amount{color:#fb923c}
    .footer{border-top:2px solid #ea580c;padding-top:12px;text-align:center;font-size:10px;color:#666}
    .footer-sig{display:flex;justify-content:space-between;margin-top:24px;padding:0 40px}
    .sig-line{border-top:1px solid #333;padding-top:4px;min-width:160px;text-align:center;font-size:10px}
    @media print{body{padding:10px}}
  </style>
</head>
<body>
  <div class="header">
    <div class="business-name">⚡ ${BUSINESS_NAME} ⚡</div>
    <div class="business-sub">Premium Gym Products &amp; Supplements</div>
    <div class="contact-bar">📞 ${BUSINESS_PHONE} &nbsp;|&nbsp; ✉ ${BUSINESS_EMAIL}</div>
    <div class="report-title">OFFICIAL SALES REPORT — ${typeLabel.toUpperCase()}</div>
    <div class="report-period">Period: ${rangeLabel}</div>
    <div class="print-date">Generated: ${format(new Date(), 'MMMM dd, yyyy — HH:mm:ss')}</div>
  </div>
  <div class="summary">
    <div class="card card-total">
      <div class="card-label">Total Revenue</div>
      <div class="card-value">GH₵${report.totalSales.toFixed(2)}</div>
      <div class="card-sub">${report.transactionCount} transaction(s)</div>
    </div>
    <div class="card card-wholesale">
      <div class="card-label">Wholesale Sales</div>
      <div class="card-value">GH₵${report.wholesaleTotal.toFixed(2)}</div>
      <div class="card-sub">${report.wholesaleCount} transaction(s)</div>
    </div>
    <div class="card card-retail">
      <div class="card-label">Retail Sales</div>
      <div class="card-value">GH₵${report.retailTotal.toFixed(2)}</div>
      <div class="card-sub">${report.retailCount} transaction(s)</div>
    </div>
  </div>
  ${report.totalSales > 0 ? `
  <div class="dist-section">
    <div class="dist-label">Sales Distribution</div>
    <div class="dist-bar">
      <div class="dist-ws" style="width:${wsPct}%"></div>
      <div class="dist-rt" style="width:${rtPct}%"></div>
    </div>
    <div class="dist-legend">
      <span class="dist-ws-text">Wholesale: ${wsPct}%</span>
      <span class="dist-rt-text">Retail: ${rtPct}%</span>
    </div>
  </div>` : ''}
  <table>
    <thead>
      <tr>
        <th>#</th><th>Receipt No.</th><th>Customer</th><th>Type</th>
        <th>Employee</th><th>Items</th>
        <th style="text-align:right">Amount</th><th>Date &amp; Time</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="8" style="text-align:center;color:#888;padding:20px">No transactions found.</td></tr>`}
    </tbody>
    ${transactions.length > 0 ? `
    <tfoot>
      <tr class="totals-row">
        <td colspan="6" style="text-align:right">GRAND TOTAL (${transactions.length} transactions)</td>
        <td class="amount" style="text-align:right">GH₵${report.totalSales.toFixed(2)}</td>
        <td></td>
      </tr>
    </tfoot>` : ''}
  </table>
  <div class="footer">
    <p>Official sales report — MUSCLE MATRIX Sales Management System.</p>
    <p style="margin-top:4px">Report ID: RPT-${Date.now().toString(36).toUpperCase()}</p>
    <div class="footer-sig">
      <div class="sig-line">Admin Signature / Date</div>
      <div class="sig-line">Verified By / Date</div>
    </div>
    <p style="margin-top:16px">© ${new Date().getFullYear()} MUSCLE MATRIX. All Rights Reserved.</p>
  </div>
</body>
</html>`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const TypeBadge: React.FC<{ type: 'wholesale' | 'retail' }> = ({ type }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        type === 'wholesale'
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            : 'bg-green-500/20 text-green-400 border-green-500/30'
    }`}>
    {type.toUpperCase()}
  </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SalesReport: React.FC = () => {
  const [dateRange,  setDateRange]  = useState<DateRange>('today');
  const [startDate,  setStartDate]  = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate,    setEndDate]    = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterType, setFilterType] = useState<SaleType>('all');
  const [report,     setReport]     = useState<ReportSummary>(emptyReport);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // ── Load data from API ──────────────────────────────────────────────────────
  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Build query params for the API
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('type', filterType);

      // For date filtering — pass date range to API or filter client-side
      // The API supports ?date= for single day, so we fetch all and filter here
      // for multi-day ranges (week / month / custom / all)
      let all = await getTransactions();

      // Apply date filter
      const today = format(new Date(), 'yyyy-MM-dd');
      if (dateRange === 'today') {
        all = all.filter((t) => t.date === today);
      } else if (dateRange === 'week') {
        const weekAgo = subDays(new Date(), 7);
        all = all.filter((t) => parseISO(t.date) >= weekAgo);
      } else if (dateRange === 'month') {
        const monthAgo = subDays(new Date(), 30);
        all = all.filter((t) => parseISO(t.date) >= monthAgo);
      } else if (dateRange === 'custom') {
        all = all.filter((t) => t.date >= startDate && t.date <= endDate);
      }
      // 'all' — no filter

      // Apply type filter
      if (filterType !== 'all') {
        all = all.filter((t) => t.type === filterType);
      }

      // Sort newest first
      const sorted = all.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTransactions(sorted);
      setReport(buildSummary(sorted));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  }, [dateRange, startDate, endDate, filterType]);

  useEffect(() => { loadReport(); }, [loadReport]);

  // ── Print ───────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const typeLabel =
        filterType === 'all'       ? 'All Sales' :
            filterType === 'wholesale' ? 'Wholesale Sales' : 'Retail Sales';

    const html = buildPrintHTML(
        transactions,
        report,
        getDateRangeLabel(dateRange, startDate, endDate),
        typeLabel,
    );
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('Please allow pop-ups for printing.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns: Column<Transaction>[] = [
    {
      key: 'index', header: '#',
      render: (_, i) => <span className="text-gray-500 text-sm">{(i ?? 0) + 1}</span>,
      width: '48px',
    },
    {
      key: 'receiptNumber', header: 'Receipt No.',
      render: (t) => <span className="text-white font-mono text-xs">{t.receiptNumber}</span>,
    },
    {
      key: 'customerName', header: 'Customer',
      render: (t) => <span className="text-white">{t.customerName}</span>,
    },
    {
      key: 'type', header: 'Type',
      render: (t) => <TypeBadge type={t.type} />,
    },
    {
      key: 'employeeName', header: 'Employee',
      render: (t) => <span className="text-gray-400 text-sm">{t.employeeName}</span>,
    },
    {
      key: 'items', header: 'Items',
      render: (t) => (
          <span className="text-gray-400 text-xs max-w-[180px] block truncate">
          {t.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
        </span>
      ),
    },
    {
      key: 'totalAmount', header: 'Amount', align: 'right',
      render: (t) => (
          <span className="text-orange-400 font-bold">GH₵{t.totalAmount.toFixed(2)}</span>
      ),
    },
    {
      key: 'createdAt', header: 'Date & Time',
      render: (t) => (
          <span className="text-gray-500 text-xs">
          {format(parseISO(t.createdAt), 'MMM dd, yyyy HH:mm')}
        </span>
      ),
    },
  ];

  const rangeLabel = getDateRangeLabel(dateRange, startDate, endDate);

  return (
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold text-white">Sales Reports</h3>
          <Button
              variant="primary"
              color="orange"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              disabled={transactions.length === 0}
          >
            Print Report
          </Button>
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {/* Filters */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-4">
          {/* Date range tabs */}
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date Range
            </p>
            <div className="flex gap-2 flex-wrap">
              {(['today', 'week', 'month', 'all', 'custom'] as DateRange[]).map((range) => (
                  <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`px-4 py-2 rounded-lg capitalize transition-colors text-sm ${
                          dateRange === range
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    {range === 'custom' ? 'Custom Range' : range === 'all' ? 'All Time' : range}
                  </button>
              ))}
            </div>
          </div>

          {/* Custom date inputs */}
          {dateRange === 'custom' && (
              <div className="flex gap-4 items-center flex-wrap">
                {[
                  { label: 'From', value: startDate, onChange: setStartDate },
                  { label: 'To',   value: endDate,   onChange: setEndDate },
                ].map(({ label, value, onChange }) => (
                    <div key={label} className="flex items-center gap-2">
                      <label className="text-gray-400 text-sm">{label}:</label>
                      <input
                          type="date"
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm"
                      />
                    </div>
                ))}
              </div>
          )}

          {/* Sale type filter */}
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Sale Type
            </p>
            <div className="flex gap-2">
              {([
                { value: 'all',       label: 'All Types',  active: 'bg-gray-500 text-white' },
                { value: 'wholesale', label: 'Wholesale',  active: 'bg-blue-600 text-white' },
                { value: 'retail',    label: 'Retail',     active: 'bg-green-600 text-white' },
              ] as { value: SaleType; label: string; active: string }[]).map(({ value, label, active }) => (
                  <button
                      key={value}
                      onClick={() => setFilterType(value)}
                      className={`px-4 py-2 rounded-lg capitalize text-sm transition-colors ${
                          filterType === value ? active : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    {label}
                  </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-bold text-white">{rangeLabel}</h4>
              {filterType !== 'all' && (
                  <p className="text-sm text-gray-400 mt-1">
                    Showing:{' '}
                    <span className="capitalize font-medium text-orange-400">{filterType} sales only</span>
                  </p>
              )}
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: 'Total Revenue',     value: report.totalSales,     count: report.transactionCount,
                gradient: 'from-purple-600 to-purple-800', muted: 'text-purple-200', icon: DollarSign, iconColor: 'text-purple-300',
              },
              {
                label: 'Wholesale Sales',   value: report.wholesaleTotal, count: report.wholesaleCount,
                gradient: 'from-blue-600 to-blue-800',     muted: 'text-blue-200',   icon: Store,       iconColor: 'text-blue-300',
              },
              {
                label: 'Retail Sales',      value: report.retailTotal,    count: report.retailCount,
                gradient: 'from-green-600 to-green-800',   muted: 'text-green-200',  icon: ShoppingBag, iconColor: 'text-green-300',
              },
            ].map(({ label, value, count, gradient, muted, icon: Icon, iconColor }) => (
                <div key={label} className={`bg-gradient-to-br ${gradient} rounded-xl p-5 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${muted} text-sm`}>{label}</p>
                      <p className="text-3xl font-bold mt-1">GH₵{value.toFixed(2)}</p>
                      <p className={`${muted} text-sm mt-2`}>{count} transaction(s)</p>
                    </div>
                    <Icon className={`w-12 h-12 ${iconColor}`} />
                  </div>
                </div>
            ))}
          </div>

          {/* Distribution bar */}
          {report.totalSales > 0 && (
              <div className="mt-6">
                <p className="text-gray-400 text-sm mb-2">Sales Distribution</p>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden flex">
                  <div
                      className="bg-blue-500 h-full transition-all duration-500"
                      style={{ width: `${(report.wholesaleTotal / report.totalSales) * 100}%` }}
                  />
                  <div
                      className="bg-green-500 h-full transition-all duration-500"
                      style={{ width: `${(report.retailTotal / report.totalSales) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
              <span className="text-blue-400">
                Wholesale: {((report.wholesaleTotal / report.totalSales) * 100).toFixed(1)}%
              </span>
                  <span className="text-green-400">
                Retail: {((report.retailTotal / report.totalSales) * 100).toFixed(1)}%
              </span>
                </div>
              </div>
          )}
        </div>

        {/* Transactions table */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-500" />
              <h4 className="text-lg font-bold text-white">
                Transaction Details ({transactions.length})
              </h4>
            </div>
            <Button
                variant="ghost"
                color="orange"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
                disabled={transactions.length === 0}
            >
              Print / Export PDF
            </Button>
          </div>

          {!loading && transactions.length === 0 ? (
              <div className="text-center text-gray-400 p-12">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="font-medium text-lg">No transactions found</p>
                <p className="text-sm mt-1">Try adjusting the date range or filters above.</p>
              </div>
          ) : (
              <>
                <DataTable
                    columns={columns}
                    data={transactions}
                    keyExtractor={(t) => t.id}
                    loading={loading}
                />

                {/* Grand total row */}
                {!loading && transactions.length > 0 && (
                    <div className="bg-gray-700/70 border-t-2 border-orange-600/50 px-4 py-3 flex justify-between items-center">
                <span className="text-gray-300 font-bold text-sm">
                  GRAND TOTAL ({transactions.length} transactions)
                </span>
                      <span className="text-orange-400 font-black text-lg">
                  GH₵{report.totalSales.toFixed(2)}
                </span>
                    </div>
                )}

                {/* Bottom print CTA */}
                {!loading && transactions.length > 0 && (
                    <div className="p-4 border-t border-gray-700 bg-gray-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-gray-400 text-sm">
                        <FileDown className="w-4 h-4 inline mr-1 text-orange-500" />
                        Use browser print-to-PDF after clicking Print Report.
                      </p>
                      <Button
                          variant="primary"
                          color="orange"
                          icon={<Printer className="w-4 h-4" />}
                          onClick={handlePrint}
                      >
                        Print Report ({transactions.length} records)
                      </Button>
                    </div>
                )}
              </>
          )}
        </div>
      </div>
  );
};

export default SalesReport;