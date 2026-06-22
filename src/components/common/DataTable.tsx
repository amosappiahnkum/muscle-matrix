import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';

export interface Column<T> {
  key:     string;
  header:  string;
  render:  (row: T, index?: number) => React.ReactNode;
  align?:  'left' | 'center' | 'right';
  width?:  string;
}

interface DataTableProps<T> {
  columns:          Column<T>[];
  data:             T[];
  keyExtractor:     (row: T) => string;
  emptyMessage?:    string;
  loading?:         boolean;
  pageSize?:        number;
  pageSizeOptions?: number[];
}

function DataTable<T extends object>({
  columns,
  data,
  keyExtractor,
  emptyMessage    = 'No data found.',
  loading         = false,
  pageSize        = 10,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTableProps<T>) {

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current:  1,
    pageSize: pageSize,
  });

  // Reset to page 1 when data or pageSize prop changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [data.length, pageSize]);

  // Map custom Column<T> definitions to Ant Design's ColumnType
  const antColumns: TableColumnsType<T> = columns.map((col) => ({
    key:       col.key,
    dataIndex: col.key,
    title:     col.header,
    align:     col.align ?? 'left',
    width:     col.width,
    render:    (_value: unknown, row: T, index: number) => {
      // Offset index by the current page so callers get the global row index
      const globalIndex =
        ((pagination.current ?? 1) - 1) * (pagination.pageSize ?? pageSize) + index;
      return col.render(row, globalIndex);
    },
  }));

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
  };

  return (
    <Table<T>
      columns={antColumns}
      dataSource={data}
      rowKey={(row) => keyExtractor(row)}
      loading={loading}
      onChange={handleTableChange}
      locale={{ emptyText: emptyMessage }}
      pagination={{
        current:          pagination.current,
        pageSize:         pagination.pageSize,
        pageSizeOptions:  pageSizeOptions.map(String),
        showSizeChanger:  true,
        showTotal:        (total, [start, end]) => `${start}–${end} of ${total}`,
      }}
    />
  );
}

export default DataTable;