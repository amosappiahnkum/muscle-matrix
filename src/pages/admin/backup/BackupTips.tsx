import React from 'react';
import { FileText } from 'lucide-react';

const TIPS = [
  {
    icon: '📅',
    title: 'Regular Backups',
    description: 'Create backups daily or at least weekly to prevent data loss.',
  },
  {
    icon: '💾',
    title: 'Multiple Copies',
    description: 'Keep multiple backup copies in different locations.',
  },
  {
    icon: '🔒',
    title: 'Secure Storage',
    description: 'Store backup files in a secure location to protect sensitive data.',
  },
];

const BackupTips: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-orange-500" />
        <h4 className="text-lg font-bold text-gray-900">Backup Tips</h4>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {TIPS.map((tip) => (
          <div key={tip.title} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-gray-900 font-semibold mb-1">
              {tip.icon} {tip.title}
            </p>
            <p className="text-gray-500 text-sm">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackupTips;