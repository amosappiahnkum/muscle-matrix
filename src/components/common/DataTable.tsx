// src/components/common/DataTable.tsx
import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index?: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  loading?: boolean;
}

function DataTable<T>({
                        columns,
                        data,
                        keyExtractor,
                        emptyMessage = 'No data found.',
                        loading = false,
                      }: DataTableProps<T>) {
  const alignClass = (align?: string) =>
      align === 'right'  ? 'text-right'  :
          align === 'center' ? 'text-center' :
              'text-left';

  if (loading) {
    return (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading...
        </div>
    );
  }

  if (data.length === 0) {
    return (
        <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
          {emptyMessage}
        </div>
    );
  }

  return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
          <tr className="border-b border-gray-700">
            {columns.map((col) => (
                <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={`px-4 py-3 font-semibold text-gray-400 uppercase tracking-wider text-xs ${alignClass(col.align)}`}
                >
                  {col.header}
                </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {data.map((row, index) => (
              <tr
                  key={keyExtractor(row)}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
              >
                {columns.map((col) => (
                    <td
                        key={col.key}
                        className={`px-4 py-3 text-gray-200 ${alignClass(col.align)}`}
                    >
                      {col.render(row, index)}
                    </td>
                ))}
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}

export default DataTable;