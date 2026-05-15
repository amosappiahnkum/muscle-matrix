import React from 'react';
import { Receipt, User, Layers } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
  bg: string;
  border: string;
  iconBg: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  accent, 
  bg, 
  border, 
  iconBg 
}) => (
  <div className={`${bg} border ${border} rounded-xl px-3 py-2.5 flex items-center justify-between`}>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-base font-bold mt-0.5 ${accent}`}>
        GH₵{value.toFixed(2)}
      </p>
    </div>
    <div className={`${iconBg} p-2 rounded-lg`}>
      <Icon size={15} className={accent} />
    </div>
  </div>
);

interface ExpenseSummaryCardsProps {
  total:  number;
  custom: number;
  batch:  number;
}

const ExpenseSummaryCards: React.FC<ExpenseSummaryCardsProps> = ({ total, custom, batch }) => (
  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <SummaryCard 
        label="Total Expenses"  
        value={total}  
        icon={Receipt}
        accent="text-orange-600"
        bg="bg-orange-50"
        border="border-orange-100"
        iconBg="bg-orange-100"
      />
      <SummaryCard 
        label="Custom Expenses" 
        value={custom} 
        icon={User}
        accent="text-amber-600"
        bg="bg-amber-50"
        border="border-amber-100"
        iconBg="bg-amber-100"
      />
      <SummaryCard 
        label="Batch Expenses"  
        value={batch}  
        icon={Layers}
        accent="text-cyan-600"
        bg="bg-cyan-50"
        border="border-cyan-100"
        iconBg="bg-cyan-100"
      />
    </div>
  </div>
);

export default ExpenseSummaryCards;