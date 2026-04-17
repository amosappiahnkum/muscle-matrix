import React from 'react';
import { format } from 'date-fns';
import { Check } from 'lucide-react';
import Button from '../../components/common/Button.tsx';

interface CheckoutPanelProps {
  type: 'wholesale' | 'retail';
  employeeUsername: string;
  employeeSignature: string;
  customerSignature: string;
  total: number;
  cartEmpty: boolean;
  onEmployeeSignatureChange: (v: string) => void;
  onCustomerSignatureChange: (v: string) => void;
  onCompleteSale: () => void;
}

const CheckoutPanel: React.FC<CheckoutPanelProps> = ({
  type,
  employeeUsername,
  employeeSignature,
  customerSignature,
  total,
  cartEmpty,
  onEmployeeSignatureChange,
  onCustomerSignatureChange,
  onCompleteSale,
}) => {
  const accent = type === 'wholesale' ? 'blue' : 'green' as const;
  const accentBg = type === 'wholesale' ? 'bg-blue-600/20' : 'bg-green-600/20';

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-4">
      {/* Date */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Transaction date</span>
        <span>{format(new Date(), 'MMMM dd, yyyy — HH:mm')}</span>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1.5">Employee Signature</label>
          <input
            type="text"
            value={employeeSignature}
            onChange={(e) => onEmployeeSignatureChange(e.target.value)}
            placeholder={employeeUsername}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1.5">Customer Signature</label>
          <input
            type="text"
            value={customerSignature}
            onChange={(e) => onCustomerSignatureChange(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Total */}
      <div className={`flex justify-between items-center p-4 rounded-xl ${accentBg} border border-gray-700`}>
        <span className="text-white font-bold text-lg">Total Amount</span>
        <span className="text-orange-400 font-black text-3xl">GH₵{total.toFixed(2)}</span>
      </div>

      {/* Complete */}
      <Button
        variant="primary"
        color={accent}
        size="lg"
        fullWidth
        disabled={cartEmpty}
        icon={<Check className="w-5 h-5" />}
        onClick={onCompleteSale}
      >
        Complete Sale &amp; Print Receipt
      </Button>
    </div>
  );
};

export default CheckoutPanel;
