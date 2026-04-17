import React from 'react';
import { Check, Printer } from 'lucide-react';
import { Transaction } from '@/types';
import { printReceipt } from './ReceiptPrinter.ts';
import Button from '../common/Button.tsx';

interface CompletedScreenProps {
  transaction: Transaction;
  type: 'wholesale' | 'retail';
  onNewSale: () => void;
  onHome: () => void;
}

const CompletedScreen: React.FC<CompletedScreenProps> = ({
  transaction,
  type,
  onNewSale,
  onHome,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-sm w-full text-center shadow-2xl">
      {/* Success icon */}
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-green-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-1">Sale Completed!</h2>
      <p className="text-gray-400 text-sm mb-6">Transaction recorded successfully</p>

      {/* Summary */}
      <div className="bg-gray-700/50 rounded-xl p-4 mb-6 text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Receipt #</span>
          <span className="text-white font-mono text-xs">{transaction.receiptNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Customer</span>
          <span className="text-white">{transaction.customerName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Items</span>
          <span className="text-white">{transaction.items.length}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-600 font-bold text-lg">
          <span className="text-white">Total</span>
          <span className="text-orange-400">GH₵{transaction.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          color="orange"
          size="lg"
          fullWidth
          icon={<Printer className="w-5 h-5" />}
          onClick={() => printReceipt(transaction)}
        >
          Print Receipt
        </Button>
        <Button
          variant="primary"
          color={type === 'wholesale' ? 'blue' : 'green'}
          size="lg"
          fullWidth
          onClick={onNewSale}
        >
          New Sale
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={onHome}
        >
          Back to Home
        </Button>
      </div>
    </div>
  </div>
);

export default CompletedScreen;
