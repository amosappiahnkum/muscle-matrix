import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { User } from '@/types';
import DataTable, { Column } from '@/components/common/DataTable';

interface EmployeeTableProps {
  employees: User[];
  loading:   boolean;
  onEdit:    (user: User) => void;
  onDelete:  (user: User) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees, loading, onEdit, onDelete,
}) => {
  const columns: Column<User>[] = [
    {
      key: 'username',
      header: 'Username',
      render: (u) => <span className="text-white font-medium">{u.username}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
          u.role === 'wholesale'
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-green-500/20 text-green-400'
        }`}>
          {u.role}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (u) => (
        <span className="text-gray-400 text-sm">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onEdit(u)}
            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(u)}
            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      <DataTable
        columns={columns}
        data={employees}
        keyExtractor={(u) => u.id}
        loading={loading}
        emptyMessage='No employees found. Click "Add Employee" to create one.'
      />
    </div>
  );
};