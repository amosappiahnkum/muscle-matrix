import React, { useState, useRef } from 'react';
import { exportDatabase, importDatabase } from '@/utils/database';
import { Database } from 'lucide-react';
import { format } from 'date-fns';

import BackupCard from './BackupCard';
import StatusMessage from './StatusMessage';
import WarningNotice from './WarningNotice';
import BackupTips from './BackupTips';

const BackupRestore: React.FC = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    try {
      const data = exportDatabase();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Muscle_Matrix_Backup_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Muscle Matrix Backup downloaded successfully!' });
      setTimeout(() => setMessage(null), 5000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to create backup. Please try again.' });
    }
  };

  const handleRestore = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = importDatabase(content);
        if (success) {
          setMessage({ type: 'success', text: 'Database restored successfully! Refreshing...' });
          setTimeout(() => window.location.reload(), 2000);
        } else {
          setMessage({ type: 'error', text: 'Invalid backup file format.' });
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to restore database. Invalid file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Backup & Restore</h3>
      </div>

      {/* Status Message */}
      <StatusMessage message={message} />

      {/* Database Management Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-6 h-6 text-orange-500" />
          <h4 className="text-lg font-bold text-gray-900">Database Management</h4>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Backup your data regularly to prevent data loss. The backup includes all employees, products,
          and transaction records. You can restore from a backup file at any time.
        </p>

        <BackupCard onBackup={handleBackup} onRestore={handleRestore} />

        <div className="mt-6">
          <WarningNotice />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Tips */}
      <BackupTips />
    </div>
  );
};

export default BackupRestore;