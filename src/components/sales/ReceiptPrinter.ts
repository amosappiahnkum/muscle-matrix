import { Transaction } from '@/types';
import { format } from 'date-fns';

export const printReceipt = (transaction: Transaction): void => {
  const rows = transaction.items.map(
    (item) => `
    <tr>
      <td>${item.productName}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">GH₵${item.unitPrice.toFixed(2)}</td>
      <td style="text-align:right">GH₵${item.totalAmount.toFixed(2)}</td>
    </tr>`
  ).join('');

  const formattedDate = (() => {
    try {
      return format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm');
    } catch {
      return transaction.date;
    }
  })();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt — ${transaction.receiptNumber}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: Arial, sans-serif;
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          color: #111;
        }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 15px; }
        .header h1 { font-size: 20px; font-weight: 900; letter-spacing: 2px; }
        .header p { font-size: 11px; color: #555; margin-top: 4px; }
        .badge {
          display: inline-block;
          padding: 3px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: bold;
          margin-top: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .wholesale { background: #3B82F6; color: #fff; }
        .retail    { background: #22C55E; color: #fff; }
        .info { margin-bottom: 12px; font-size: 12px; }
        .info-row { display: flex; justify-content: space-between; margin: 4px 0; }
        .info-row span:last-child { font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; }
        th { background: #f0f0f0; padding: 6px 4px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 7px 4px; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: 900; text-align: right; margin-top: 12px; padding-top: 12px; border-top: 2px solid #333; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-size: 11px; }
        .sig { text-align: center; width: 45%; }
        .sig-line { border-top: 1px solid #333; padding-top: 5px; margin-top: 36px; font-weight: 600; }
        .sig-name { font-style: italic; color: #555; margin-top: 3px; }
        .footer { text-align: center; margin-top: 36px; font-size: 10px; color: #888; border-top: 1px dashed #ccc; padding-top: 12px; line-height: 1.6; }
        @media print {
          body { padding: 0; }
          @page { margin: 10mm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>⚡ MUSCLE MATRIX ⚡</h1>
        <p>Phone: 0245349937</p>
        <p>Email: emmanueleshun558@gmail.com</p>
        <span class="badge ${transaction.type}">${transaction.type}</span>
      </div>

      <div class="info">
        <div class="info-row"><span>Receipt #</span><span>${transaction.receiptNumber}</span></div>
        <div class="info-row"><span>Date</span><span>${formattedDate}</span></div>
        <div class="info-row"><span>Customer</span><span>${transaction.customerName}</span></div>
        <div class="info-row"><span>Served by</span><span>${transaction.employeeName}</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Unit</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="total">TOTAL: GH₵${transaction.totalAmount.toFixed(2)}</div>

      <div class="signatures">
        <div class="sig">
          <div class="sig-line">Employee Signature</div>
          <p class="sig-name">${transaction.employeeSignature ?? transaction.employeeName}</p>
        </div>
        <div class="sig">
          <div class="sig-line">Customer Signature</div>
          <p class="sig-name">${transaction.customerSignature ?? ''}</p>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your patronage!</p>
        <p>Quality Gym Products for Champions</p>
        <p>All sales are final. No refunds or exchanges.</p>
      </div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    // Small delay lets styles load before print dialog opens
    setTimeout(() => win.print(), 300);
  }
};
