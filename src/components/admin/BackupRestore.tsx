// Backup & Restore Component

import React, { useState, useRef } from 'react';
import { exportDatabase, importDatabase } from '../../utils/database';
import { Download, Upload, AlertCircle, Check, FileText, Database } from 'lucide-react';
import { format } from 'date-fns';

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
    } catch (error) {
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
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setMessage({ type: 'error', text: 'Invalid backup file format.' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to restore database. Invalid file.' });
      }
    };
    reader.readAsText(file);

    // Reset the input
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Backup & Restore</h3>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-orange-500" />
          <h4 className="text-lg font-bold text-white">Database Management</h4>
        </div>
        <p className="text-gray-400 mb-6">
          Backup your data regularly to prevent data loss. The backup includes all employees, products, and transaction records.
          You can restore from a backup file at any time.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Backup Section */}
          <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Download className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h5 className="text-white font-medium">Create Backup</h5>
                <p className="text-gray-400 text-sm">Export all data to a file</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Download a complete backup of your database including all employees, products, and transactions.
            </p>
            <button
              onClick={handleBackup}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Backup
            </button>
          </div>

          {/* Restore Section */}
          <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Upload className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h5 className="text-white font-medium">Restore Backup</h5>
                <p className="text-gray-400 text-sm">Import data from a file</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Restore your database from a previously created backup file. This will replace all current data.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={handleRestore}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Restore from File
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium">Important Notes:</p>
            <ul className="text-yellow-200/80 text-sm mt-2 space-y-1">
              <li>• Restoring from backup will replace ALL current data</li>
              <li>• Create a backup before restoring to preserve current data</li>
              <li>• Only restore from trusted backup files</li>
              <li>• The page will refresh after a successful restore</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-orange-500" />
          <h4 className="text-lg font-bold text-white">Backup Tips</h4>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <p className="text-white font-medium mb-2">📅 Regular Backups</p>
            <p className="text-gray-400 text-sm">Create backups daily or at least weekly to prevent data loss.</p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <p className="text-white font-medium mb-2">💾 Multiple Copies</p>
            <p className="text-gray-400 text-sm">Keep multiple backup copies in different locations.</p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <p className="text-white font-medium mb-2">🔒 Secure Storage</p>
            <p className="text-gray-400 text-sm">Store backup files in a secure location to protect sensitive data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
