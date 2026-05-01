import React from 'react';
import { format } from 'date-fns';
import { Check, CalendarDays } from 'lucide-react';
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
  const accent       = type === 'wholesale' ? 'blue' : 'green' as const;
  const totalRingBg  = type === 'wholesale' ? 'bg-blue-50 border-blue-100'  : 'bg-green-50 border-green-100';
  const totalRingText = type === 'wholesale' ? 'text-blue-700' : 'text-green-700';

  return (
    <div className="px-4 pb-4 pt-3 space-y-3">

      {/* Date */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <CalendarDays className="w-3.5 h-3.5 shrink-0" />
        <span>{format(new Date(), 'EEE, MMM dd yyyy · HH:mm')}</span>
      </div>

      {/* Signatures — side by side, compact */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Customer Sig.
          </label>
          <input
            type="text"
            value={customerSignature}
            onChange={(e) => onCustomerSignatureChange(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 text-xs focus:outline-none focus:border-blue-300 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Employee Sig.
          </label>
          <input
            type="text"
            value={employeeSignature}
            onChange={(e) => onEmployeeSignatureChange(e.target.value)}
            placeholder={employeeUsername}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 placeholder-gray-400 text-xs focus:outline-none focus:border-gray-300 transition-all"
          />
        </div>
      </div>

      {/* Total + Button row */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${totalRingBg}`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total</p>
          <p className={`text-xl font-black tracking-tight ${totalRingText}`}>
            GH₵{total.toFixed(2)}
          </p>
        </div>
        <Button
          variant="primary"
          color={accent}
          size="sm"
          disabled={cartEmpty}
          icon={<Check className="w-4 h-4" />}
          onClick={onCompleteSale}
        >
          Complete &amp; Print
        </Button>
      </div>

    </div>
  );
};

export default CheckoutPanel;