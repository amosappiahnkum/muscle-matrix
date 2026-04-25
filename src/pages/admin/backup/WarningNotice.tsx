import React from 'react';
import { AlertCircle } from 'lucide-react';

const WARNINGS = [
  'Restoring from backup will replace ALL current data',
  'Create a backup before restoring to preserve current data',
  'Only restore from trusted backup files',
  'The page will refresh after a successful restore',
];

const WarningNotice: React.FC = () => {
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-amber-700 font-semibold text-sm">Important Notes:</p>
        <ul className="text-amber-600 text-sm mt-2 space-y-1">
          {WARNINGS.map((warning, i) => (
            <li key={i}>• {warning}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WarningNotice;