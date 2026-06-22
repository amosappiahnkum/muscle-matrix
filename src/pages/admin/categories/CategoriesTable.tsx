import React from 'react';
import { Popconfirm, Spin, Tooltip } from 'antd';
import { Pencil, Trash2, Tag } from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import { Category } from '@/api/api';

interface CategoriesTableProps {
  data:     Category[];
  loading:  boolean;
  deleting: number | null;
  search:   string;
  onEdit:   (c: Category) => void;
  onDelete: (id: number) => void;
}

// forwardRef so Popconfirm can attach its trigger ref directly
const IconButton = React.forwardRef<
  HTMLButtonElement,
  {
    onClick?:  () => void;
    danger?:   boolean;
    loading?:  boolean;
    children:  React.ReactNode;
  }
>(({ onClick, danger, loading, children, ...rest }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    {...rest}
    style={{
      width: 30, height: 30, borderRadius: 6,
      border: '1px solid #e5e7eb', background: '#fff',
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#6b7280', transition: 'all 0.15s',
      opacity: loading ? 0.5 : 1,
    }}
    onMouseEnter={(e) => {
      if (loading) return;
      e.currentTarget.style.borderColor = danger ? '#ef4444' : '#a855f7';
      e.currentTarget.style.color       = danger ? '#ef4444' : '#a855f7';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#e5e7eb';
      e.currentTarget.style.color       = '#6b7280';
    }}
  >
    {loading ? <Spin size="small" /> : children}
  </button>
));
IconButton.displayName = 'IconButton';

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  data, loading, deleting, search, onEdit, onDelete,
}) => {
  const columns: Column<Category>[] = [
    {
      key:    'name',
      header: 'Name',
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 6,
            background: '#fdf4ff', border: '1px solid #e9d5ff', flexShrink: 0,
          }}>
            <Tag size={13} style={{ color: '#a855f7' }} />
          </span>
          <span style={{ fontWeight: 600, color: '#111827' }}>{c.name}</span>
        </div>
      ),
    },
    {
      key:    'description',
      header: 'Description',
      render: (c) => (
        <span style={{ color: c.description ? '#374151' : '#9ca3af' }}>
          {c.description ?? '—'}
        </span>
      ),
    },
    {
      key:    'createdAt',
      header: 'Added',
      width:  '140px',
      render: (c) => (
        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          {c.createdAt
            ? new Date(c.createdAt).toLocaleDateString('en-GH', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
            : '—'}
        </span>
      ),
    },
    {
      key:    'actions',
      header: '',
      align:  'right',
      width:  '90px',
      render: (c) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Tooltip title="Edit">
            <IconButton onClick={() => onEdit(c)}>
              <Pencil size={13} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this category?"
              description="This cannot be undone."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(c.id)}
            >
              <IconButton danger loading={deleting === c.id}>
                <Trash2 size={13} />
              </IconButton>
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(c) => String(c.id)}
        loading={loading}
        emptyMessage={
          search
            ? 'No categories match your search.'
            : 'No categories yet. Add your first one.'
        }
        pageSize={15}
      />
    </div>
  );
};

export default CategoriesTable;