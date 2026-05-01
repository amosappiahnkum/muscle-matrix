import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface Column<T> {
  key:     string;
  header:  string;
  render:  (row: T, index?: number) => React.ReactNode;
  align?:  'left' | 'center' | 'right';
  width?:  string;
}

interface DataTableProps<T> {
  columns:        Column<T>[];
  data:           T[];
  keyExtractor:   (row: T) => string;
  emptyMessage?:  string;
  loading?:       boolean;
  pageSize?:      number;        // rows per page, default 10
  pageSizeOptions?: number[];    // choices shown in the selector
}

const alignClass = (align?: string) =>
  align === 'right'  ? 'text-right'  :
  align === 'center' ? 'text-center' :
  'text-left';

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage    = 'No data found.',
  loading         = false,
  pageSize        = 10,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTableProps<T>) {

  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(pageSize);

  // Reset to page 1 when data or perPage changes
  useEffect(() => { setPage(1); }, [data.length, perPage]);

  const totalPages = Math.max(1, Math.ceil(data.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const start      = (safePage - 1) * perPage;
  const pageData   = data.slice(start, start + perPage);

  /* ── Loading ───────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-gray-400 text-sm">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading...
      </div>
    );
  }

  /* ── Empty ─────────────────────────────────────────────── */
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
        {emptyMessage}
      </div>
    );
  }

  /* ── Page number buttons ───────────────────────────────── */
  const pageButtons = () => {
    const buttons: (number | '…')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else {
      buttons.push(1);
      if (safePage > 3)            buttons.push('…');
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        buttons.push(i);
      }
      if (safePage < totalPages - 2) buttons.push('…');
      buttons.push(totalPages);
    }
    return buttons;
  };

  /* ── Table ─────────────────────────────────────────────── */
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={`px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider
                  text-xs ${alignClass(col.align)}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {pageData.map((row, index) => (
            <tr
              key={keyExtractor(row)}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-gray-700 ${alignClass(col.align)}`}
                >
                  {col.render(row, start + index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Pagination footer ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between
        gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200">

        {/* Left: row count + per-page selector */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>
            {start + 1}–{Math.min(start + perPage, data.length)} of {data.length}
          </span>
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs
                text-gray-700 focus:outline-none focus:border-orange-400 cursor-pointer"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: page controls */}
        <div className="flex items-center gap-1">
          {/* First */}
          <button
            onClick={() => setPage(1)}
            disabled={safePage === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="First page"
          >
            <ChevronsLeft size={15} />
          </button>

          {/* Prev */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Page numbers */}
          {pageButtons().map((btn, i) =>
            btn === '…' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-xs select-none">…</span>
            ) : (
              <button
                key={btn}
                onClick={() => setPage(btn)}
                className={`min-w-[30px] h-[30px] px-2 rounded-lg text-xs font-medium transition-colors
                  ${btn === safePage
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {btn}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight size={15} />
          </button>

          {/* Last */}
          <button
            onClick={() => setPage(totalPages)}
            disabled={safePage === totalPages}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Last page"
          >
            <ChevronsRight size={15} />
          </button>
        </div>
      </div>

    </div>
  );
}

export default DataTable;