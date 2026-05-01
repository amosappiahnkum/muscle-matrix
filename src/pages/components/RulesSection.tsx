import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

const RULES: string[] = [
  'Employees must log in with assigned credentials only',
  'No price manipulation allowed',
  'All sales must be recorded through the system',
  'Do not share login credentials',
  'Always verify product quantities before sale',
  'Receipts must be issued for every transaction',
  'Admin approval required for edits/deletions',
  'Maintain professionalism with customers',
];

const RulesSection: React.FC = () => (
  <section className="bg-white border-t border-gray-100 py-16 px-4">
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="rules__shield w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={18} />
        </div>
        <h2 className="font-display text-3xl font-extrabold tracking-wide text-gray-900">
          Rules &amp; Regulations
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {RULES.map((rule, index) => (
          <div key={index} className="rule-item flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl transition-colors duration-200">
            <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
              {index + 1}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{rule}</p>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="rules__warning flex items-center gap-3 mt-4 p-3 rounded-xl">
        <AlertTriangle size={16} className="flex-shrink-0" />
        <span className="text-sm">
          Violation of these rules may result in disciplinary action or termination.
        </span>
      </div>

    </div>
  </section>
);

export default RulesSection;