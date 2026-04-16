// Transaction History Component

import React, { useState, useEffect } from 'react';
import { getTransactions } from '../../utils/database';
import { Transaction } from '../../types';
import { format, parseISO } from 'date-fns';
import { Search, FileText, X, Eye, Printer } from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'wholesale' | 'retail'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, typeFilter, transactions]);

  const loadTransactions = () => {
    const allTransactions = getTransactions().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setTransactions(allTransactions);
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.receiptNumber.toLowerCase().includes(query) ||
        t.customerName.toLowerCase().includes(query) ||
        t.employeeName.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handlePrint = (transaction: Transaction) => {
    const printContent = `
      <html>
        <head>
          <title>Receipt - ${transaction.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 15px; }
            .header h1 { font-size: 18px; margin: 0; }
            .header p { margin: 5px 0; font-size: 12px; color: #666; }
            .info { margin-bottom: 15px; font-size: 12px; }
            .info-row { display: flex; justify-content: space-between; margin: 3px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
            th, td { padding: 8px 4px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; }
            .total { font-size: 16px; font-weight: bold; text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #333; }
            .signatures { display: flex; justify-content: space-between; margin-top: 30px; font-size: 12px; }
            .signature { text-align: center; }
            .signature-line { border-top: 1px solid #333; width: 120px; margin-top: 30px; padding-top: 5px; }
            .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚡ MUSCLE MATRIX ⚡</h1>
            <p>Phone: 0245349937</p>
            <p>Email: emmanueleshun558@gmail.com</p>
          </div>
          <div class="info">
            <div class="info-row"><span>Receipt #:</span><span>${transaction.receiptNumber}</span></div>
            <div class="info-row"><span>Date:</span><span>${format(parseISO(transaction.createdAt), 'MMM dd, yyyy HH:mm')}</span></div>
            <div class="info-row"><span>Type:</span><span>${transaction.type.toUpperCase()}</span></div>
            <div class="info-row"><span>Customer:</span><span>${transaction.customerName}</span></div>
            <div class="info-row"><span>Served by:</span><span>${transaction.employeeName}</span></div>
          </div>
          <table>
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${transaction.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>GH₵${item.unitPrice.toFixed(2)}</td>
                  <td>GH₵${item.totalAmount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">TOTAL: GH₵${transaction.totalAmount.toFixed(2)}</div>
          <div class="signatures">
            <div class="signature">
              <div class="signature-line">Employee Signature</div>
              <p>${transaction.employeeSignature || ''}</p>
            </div>
            <div class="signature">
              <div class="signature-line">Customer Signature</div>
              <p>${transaction.customerSignature || ''}</p>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your patronage!</p>
            <p>All sales are final. No refunds or exchanges.</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-xl font-bold text-white">Transaction History</h3>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              placeholder="Search by receipt, customer..."
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Types</option>
            <option value="wholesale">Wholesale</option>
            <option value="retail">Retail</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left text-gray-300 font-medium p-4">Receipt #</th>
                <th className="text-left text-gray-300 font-medium p-4">Customer</th>
                <th className="text-left text-gray-300 font-medium p-4">Type</th>
                <th className="text-left text-gray-300 font-medium p-4">Items</th>
                <th className="text-right text-gray-300 font-medium p-4">Amount</th>
                <th className="text-left text-gray-300 font-medium p-4">Date</th>
                <th className="text-right text-gray-300 font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 p-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p>No transactions found.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trans) => (
                  <tr key={trans.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                    <td className="p-4 text-white font-mono text-sm">{trans.receiptNumber}</td>
                    <td className="p-4 text-white">{trans.customerName}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        trans.type === 'wholesale'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {trans.type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{trans.items.length} items</td>
                    <td className="p-4 text-right text-orange-400 font-medium">
                      GH₵{trans.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-400">
                      {format(parseISO(trans.createdAt), 'MMM dd, HH:mm')}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedTransaction(trans)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(trans)}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
              <h4 className="text-lg font-bold text-white">Transaction Details</h4>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Receipt #</p>
                  <p className="text-white font-mono">{selectedTransaction.receiptNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="text-white">{format(parseISO(selectedTransaction.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-gray-400">Customer</p>
                  <p className="text-white">{selectedTransaction.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Type</p>
                  <p className={`capitalize ${selectedTransaction.type === 'wholesale' ? 'text-blue-400' : 'text-green-400'}`}>
                    {selectedTransaction.type}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Employee</p>
                  <p className="text-white">{selectedTransaction.employeeName}</p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <p className="text-gray-400 mb-3">Items</p>
                <div className="space-y-2">
                  {selectedTransaction.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
                      <div>
                        <p className="text-white">{item.productName}</p>
                        <p className="text-gray-400 text-sm">
                          {item.quantity} × GH₵{item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-orange-400 font-medium">GH₵{item.totalAmount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                <p className="text-lg font-bold text-white">Total</p>
                <p className="text-2xl font-bold text-orange-500">GH₵{selectedTransaction.totalAmount.toFixed(2)}</p>
              </div>

              <button
                onClick={() => handlePrint(selectedTransaction)}
                className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
