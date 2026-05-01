import React from 'react';
import { Download, Upload } from 'lucide-react';

interface BackupCardProps {
  onBackup: () => void;
  onRestore: () => void;
}

const BackupCard: React.FC<BackupCardProps> = ({ onBackup, onRestore }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h5 className="text-gray-900 font-semibold">Create Backup</h5>
            <p className="text-gray-500 text-sm">Export all data to a file</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Download a complete backup of your database including all employees, products, and transactions.
        </p>
        <button
          onClick={onBackup}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Download className="w-5 h-5" />
          Download Backup
        </button>
      </div>

      <div className="bg-green-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <Upload className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h5 className="text-gray-900 font-semibold">Restore Backup</h5>
            <p className="text-gray-500 text-sm">Import data from a file</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Restore your database from a previously created backup file. This will replace all current data.
        </p>
        <button
          onClick={onRestore}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Upload className="w-5 h-5" />
          Restore from File
        </button>
      </div>
    </div>
  );
};

export default BackupCard;