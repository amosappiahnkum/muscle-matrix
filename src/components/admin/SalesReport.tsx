// Sales Report Component — with full Print support for all or ranged reports

import React, { useState, useEffect, useRef } from 'react';
import { getTransactions } from '../../utils/database';
import { Transaction } from '../../types';
import { format, subDays, parseISO } from 'date-fns';
import {
  Calendar,
  DollarSign,
  ShoppingCart,
  Store,
  ShoppingBag,
  Printer,
  FileDown,
  TrendingUp,
  Receipt,
  Filter
} from 'lucide-react';

const BUSINESS_NAME = 'MUSCLE MATRIX';
const BUSINESS_PHONE = '0245349937';
const BUSINESS_EMAIL = 'emmanueleshun558@gmail.com';

const SalesReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all' | 'custom'>('today');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterType, setFilterType] = useState<'all' | 'wholesale' | 'retail'>('all');
  const [report, setReport] = useState({
    wholesaleTotal: 0,
    retailTotal: 0,
    totalSales: 0,
    transactionCount: 0,
    wholesaleCount: 0,
    retailCount: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReport();
  }, [dateRange, startDate, endDate, filterType]);

  const loadReport = () => {
    const allTransactions = getTransactions();
    let filtered: Transaction[] = [];

    if (dateRange === 'today') {
      const today = format(new Date(), 'yyyy-MM-dd');
      filtered = allTransactions.filter(t => t.date === today);
    } else if (dateRange === 'week') {
      const weekAgo = subDays(new Date(), 7);
      filtered = allTransactions.filter(t => parseISO(t.date) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = subDays(new Date(), 30);
      filtered = allTransactions.filter(t => parseISO(t.date) >= monthAgo);
    } else if (dateRange === 'all') {
      filtered = [...allTransactions];
    } else {
      // custom range
      filtered = allTransactions.filter(t => t.date >= startDate && t.date <= endDate);
    }

    // Apply sale type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    const wholesaleT = filtered.filter(t => t.type === 'wholesale');
    const retailT = filtered.filter(t => t.type === 'retail');
    const wholesaleTotal = wholesaleT.reduce((s, t) => s + t.totalAmount, 0);
    const retailTotal = retailT.reduce((s, t) => s + t.totalAmount, 0);

    setReport({
      wholesaleTotal,
      retailTotal,
      totalSales: wholesaleTotal + retailTotal,
      transactionCount: filtered.length,
      wholesaleCount: wholesaleT.length,
      retailCount: retailT.length,
    });

    setTransactions(
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'today': return `Today — ${format(new Date(), 'MMMM dd, yyyy')}`;
      case 'week': return `Last 7 Days (${format(subDays(new Date(), 7), 'MMM dd')} – ${format(new Date(), 'MMM dd, yyyy')})`;
      case 'month': return `Last 30 Days (${format(subDays(new Date(), 30), 'MMM dd')} – ${format(new Date(), 'MMM dd, yyyy')})`;
      case 'all': return 'All Time Report';
      case 'custom': return `${startDate} to ${endDate}`;
      default: return '';
    }
  };

  // ─── PRINT HANDLER ───────────────────────────────────────────────────────────
  const handlePrint = () => {
    const printContent = buildPrintHTML();
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow pop-ups for printing.');
      return;
    }
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    // Slight delay to ensure content loads before print dialog
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const buildPrintHTML = (): string => {
    const typeLabel =
      filterType === 'all' ? 'All Sales' :
      filterType === 'wholesale' ? 'Wholesale Sales' : 'Retail Sales';

    const rows = transactions.map((t, i) => `
      <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
        <td>${i + 1}</td>
        <td class="mono">${t.receiptNumber}</td>
        <td>${t.customerName}</td>
        <td class="badge-${t.type}">${t.type.toUpperCase()}</td>
        <td>${t.employeeName}</td>
        <td>${t.items.map(item => `${item.productName} ×${item.quantity}`).join(', ')}</td>
        <td class="amount">GH₵${t.totalAmount.toFixed(2)}</td>
        <td>${format(parseISO(t.createdAt), 'MMM dd, yyyy HH:mm')}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${BUSINESS_NAME} — Sales Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 20px; }

          /* ── Header ── */
          .header { text-align: center; border-bottom: 3px solid #ea580c; padding-bottom: 16px; margin-bottom: 20px; }
          .business-name { font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #ea580c; }
          .business-sub { font-size: 12px; color: #555; margin-top: 4px; }
          .contact-bar { margin-top: 6px; font-size: 11px; color: #444; }
          .report-title { font-size: 16px; font-weight: 700; margin-top: 12px; color: #1a1a1a; }
          .report-period { font-size: 12px; color: #555; margin-top: 3px; }
          .print-date { font-size: 10px; color: #888; margin-top: 3px; }

          /* ── Summary Cards ── */
          .summary { display: flex; gap: 16px; margin-bottom: 20px; }
          .card { flex: 1; border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; }
          .card-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 4px; }
          .card-value { font-size: 22px; font-weight: 900; }
          .card-sub { font-size: 10px; color: #888; margin-top: 2px; }
          .card-total .card-value { color: #7c3aed; }
          .card-wholesale .card-value { color: #2563eb; }
          .card-retail .card-value { color: #16a34a; }

          /* ── Distribution Bar ── */
          .dist-section { margin-bottom: 20px; }
          .dist-label { font-size: 10px; color: #666; margin-bottom: 4px; }
          .dist-bar { height: 10px; background: #e5e7eb; border-radius: 9999px; overflow: hidden; display: flex; }
          .dist-ws { background: #3b82f6; height: 100%; }
          .dist-rt { background: #22c55e; height: 100%; }
          .dist-legend { display: flex; justify-content: space-between; margin-top: 4px; font-size: 10px; }
          .dist-ws-text { color: #2563eb; }
          .dist-rt-text { color: #16a34a; }

          /* ── Table ── */
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
          th { background: #ea580c; color: #fff; padding: 8px 6px; text-align: left; }
          td { padding: 6px 6px; border-bottom: 1px solid #e5e7eb; }
          .row-even { background: #fff; }
          .row-odd { background: #fef3e2; }
          .mono { font-family: monospace; font-size: 10px; }
          .amount { font-weight: 700; color: #ea580c; text-align: right; }
          td:last-child { font-size: 10px; color: #555; }
          .badge-wholesale { color: #2563eb; font-weight: 700; font-size: 10px; }
          .badge-retail { color: #16a34a; font-weight: 700; font-size: 10px; }

          /* ── Totals Row ── */
          .totals-row td { background: #1a1a1a; color: #fff; font-weight: 700; padding: 8px 6px; font-size: 12px; }
          .totals-row .amount { color: #fb923c; }

          /* ── Footer ── */
          .footer { border-top: 2px solid #ea580c; padding-top: 12px; text-align: center; font-size: 10px; color: #666; }
          .footer-sig { display: flex; justify-content: space-between; margin-top: 24px; padding: 0 40px; }
          .sig-line { border-top: 1px solid #333; padding-top: 4px; min-width: 160px; text-align: center; font-size: 10px; }

          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="business-name">⚡ MUSCLE MATRIX ⚡</div>
          <div class="business-sub">Premium Gym Products &amp; Supplements</div>
          <div class="contact-bar">
            📞 ${BUSINESS_PHONE} &nbsp;|&nbsp; ✉ ${BUSINESS_EMAIL}
          </div>
          <div class="report-title">OFFICIAL SALES REPORT — ${typeLabel.toUpperCase()}</div>
          <div class="report-period">Period: ${getDateRangeLabel()}</div>
          <div class="print-date">Generated: ${format(new Date(), 'MMMM dd, yyyy — HH:mm:ss')}</div>
        </div>

        <!-- Summary Cards -->
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

        <!-- Distribution Bar -->
        ${report.totalSales > 0 ? `
        <div class="dist-section">
          <div class="dist-label">Sales Distribution</div>
          <div class="dist-bar">
            <div class="dist-ws" style="width:${(report.wholesaleTotal / report.totalSales) * 100}%"></div>
            <div class="dist-rt" style="width:${(report.retailTotal / report.totalSales) * 100}%"></div>
          </div>
          <div class="dist-legend">
            <span class="dist-ws-text">Wholesale: ${((report.wholesaleTotal / report.totalSales) * 100).toFixed(1)}%</span>
            <span class="dist-rt-text">Retail: ${((report.retailTotal / report.totalSales) * 100).toFixed(1)}%</span>
          </div>
        </div>
        ` : ''}

        <!-- Transactions Table -->
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Receipt No.</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Employee</th>
              <th>Items</th>
              <th style="text-align:right">Amount</th>
              <th>Date &amp; Time</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="8" style="text-align:center;color:#888;padding:20px">No transactions found for this period.</td></tr>`}
          </tbody>
          ${transactions.length > 0 ? `
          <tfoot>
            <tr class="totals-row">
              <td colspan="6" style="text-align:right">GRAND TOTAL (${transactions.length} transactions)</td>
              <td class="amount" style="text-align:right">GH₵${report.totalSales.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
          ` : ''}
        </table>

        <!-- Footer -->
        <div class="footer">
          <p>This is an official sales report generated by the MUSCLE MATRIX Sales Management System.</p>
          <p style="margin-top:4px">For account verification and audit purposes only. Report ID: RPT-${Date.now().toString(36).toUpperCase()}</p>

          <div class="footer-sig">
            <div class="sig-line">Admin Signature / Date</div>
            <div class="sig-line">Verified By / Date</div>
          </div>

          <p style="margin-top:16px">© ${new Date().getFullYear()} MUSCLE MATRIX. All Rights Reserved.</p>
        </div>
      </body>
      </html>
    `;
  };

  // ─── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6" ref={printRef}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-xl font-bold text-white">Sales Reports</h3>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors font-medium shadow-lg"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Date Range + Type Filters */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-4">
        {/* Date Range Tabs */}
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date Range
          </p>
          <div className="flex gap-2 flex-wrap">
            {(['today', 'week', 'month', 'all', 'custom'] as const).map((range) => (
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

        {/* Custom Date Inputs */}
        {dateRange === 'custom' && (
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* Sale Type Filter */}
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Sale Type
          </p>
          <div className="flex gap-2">
            {(['all', 'wholesale', 'retail'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg capitalize text-sm transition-colors ${
                  filterType === type
                    ? type === 'all' ? 'bg-gray-500 text-white'
                      : type === 'wholesale' ? 'bg-blue-600 text-white'
                      : 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-bold text-white">{getDateRangeLabel()}</h4>
            {filterType !== 'all' && (
              <p className="text-sm text-gray-400 mt-1">
                Showing: <span className="capitalize font-medium text-orange-400">{filterType} sales only</span>
              </p>
            )}
          </div>
          <TrendingUp className="w-8 h-8 text-orange-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Sales */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold mt-1">GH₵{report.totalSales.toFixed(2)}</p>
                <p className="text-purple-200 text-sm mt-2">{report.transactionCount} transaction(s)</p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-300" />
            </div>
          </div>

          {/* Wholesale Sales */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Wholesale Sales</p>
                <p className="text-3xl font-bold mt-1">GH₵{report.wholesaleTotal.toFixed(2)}</p>
                <p className="text-blue-200 text-sm mt-2">{report.wholesaleCount} transaction(s)</p>
              </div>
              <Store className="w-12 h-12 text-blue-300" />
            </div>
          </div>

          {/* Retail Sales */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Retail Sales</p>
                <p className="text-3xl font-bold mt-1">GH₵{report.retailTotal.toFixed(2)}</p>
                <p className="text-green-200 text-sm mt-2">{report.retailCount} transaction(s)</p>
              </div>
              <ShoppingBag className="w-12 h-12 text-green-300" />
            </div>
          </div>
        </div>

        {/* Sales Distribution Bar */}
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

      {/* Transactions Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-500" />
            <h4 className="text-lg font-bold text-white">
              Transaction Details ({transactions.length})
            </h4>
          </div>
          {/* Print Button (duplicate for convenience) */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 bg-orange-600/20 border border-orange-600/40 hover:bg-orange-600/30 text-orange-400 rounded-lg transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Export PDF
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center text-gray-400 p-12">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="font-medium text-lg">No transactions found</p>
            <p className="text-sm mt-1">Try adjusting the date range or filters above.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left text-gray-300 font-medium p-4 text-sm">#</th>
                    <th className="text-left text-gray-300 font-medium p-4 text-sm">Receipt No.</th>
                    <th className="text-left text-gray-300 font-medium p-4 text-sm">Customer</th>
                    <th className="text-left text-gray-300 font-medium p-4 text-sm">Type</th>
                    <th className="text-left text-gray-300 font-medium p-4 text-sm">Employee</th>
                    <th className="text-left text-gray-300 font-medium p-4 text-sm">Items</th>
                    <th className="text-right text-gray-300 font-medium p-4 text-sm">Amount</th>
                    <th className="text-left text-gray-300 font-medium p-4 text-sm">Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((trans, idx) => (
                    <tr key={trans.id} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 text-gray-500 text-sm">{idx + 1}</td>
                      <td className="p-4 text-white font-mono text-xs">{trans.receiptNumber}</td>
                      <td className="p-4 text-white">{trans.customerName}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trans.type === 'wholesale'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {trans.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{trans.employeeName}</td>
                      <td className="p-4 text-gray-400 text-xs max-w-[180px]">
                        {trans.items.map(item => `${item.productName} ×${item.quantity}`).join(', ')}
                      </td>
                      <td className="p-4 text-right text-orange-400 font-bold">
                        GH₵{trans.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                        {format(parseISO(trans.createdAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Grand Total Row */}
                <tfoot>
                  <tr className="bg-gray-700/70 border-t-2 border-orange-600/50">
                    <td colSpan={6} className="p-4 text-right text-gray-300 font-bold text-sm">
                      GRAND TOTAL ({transactions.length} transactions)
                    </td>
                    <td className="p-4 text-right text-orange-400 font-black text-lg">
                      GH₵{report.totalSales.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom Print CTA */}
            <div className="p-4 border-t border-gray-700 bg-gray-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-gray-400 text-sm">
                <FileDown className="w-4 h-4 inline mr-1 text-orange-500" />
                Print this report as PDF using your browser's print-to-PDF feature after clicking Print Report.
              </p>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg transition-all font-semibold shadow-lg text-sm"
              >
                <Printer className="w-4 h-4" />
                Print Report (All {transactions.length} records)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
