import { format, parseISO } from 'date-fns';
import { Transaction } from '@/types';
import { ReportSummary, BUSINESS_NAME, BUSINESS_PHONE, BUSINESS_EMAIL } from '@/types';

export const buildPrintHTML = (
  transactions: Transaction[],
  report:       ReportSummary,
  rangeLabel:   string,
  typeLabel:    string,
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
    <p>Official sales report — ${BUSINESS_NAME} Sales Management System.</p>
    <p style="margin-top:4px">Report ID: RPT-${Date.now().toString(36).toUpperCase()}</p>
    <div class="footer-sig">
      <div class="sig-line">Admin Signature / Date</div>
      <div class="sig-line">Verified By / Date</div>
    </div>
    <p style="margin-top:16px">© ${new Date().getFullYear()} ${BUSINESS_NAME}. All Rights Reserved.</p>
  </div>
</body>
</html>`;
};

export const triggerPrint = (html: string) => {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) { alert('Please allow pop-ups for printing.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 500);
};