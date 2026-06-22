import React from 'react';
import { Popconfirm, Spin, Tooltip } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import { Supplier } from '@/api/api';

interface SuppliersTableProps {
  data:     Supplier[];
  loading:  boolean;
  deleting: number | null;
  search:   string;
  onEdit:   (s: Supplier) => void;
  onDelete: (id: number) => void;
}

// Plain button — used inside Popconfirm (no Tooltip wrapper so Popconfirm
// can attach its event listeners directly to the DOM node)
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
      e.currentTarget.style.borderColor = danger ? '#ef4444' : '#3b82f6';
      e.currentTarget.style.color       = danger ? '#ef4444' : '#3b82f6';
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

const OptionalCell: React.FC<{ value?: string | null }> = ({ value }) => (
  <span style={{ color: value ? '#374151' : '#9ca3af' }}>{value ?? '—'}</span>
);

const SuppliersTable: React.FC<SuppliersTableProps> = ({
  data, loading, deleting, search, onEdit, onDelete,
}) => {
  const columns: Column<Supplier>[] = [
    {
      key:    'name',
      header: 'Name',
      render: (s) => <span style={{ fontWeight: 600, color: '#111827' }}>{s.name}</span>,
    },
    {
      key:    'contactPerson',
      header: 'Contact Person',
      render: (s) => <OptionalCell value={s.contactPerson} />,
    },
    {
      key:    'phone',
      header: 'Phone',
      render: (s) => <OptionalCell value={s.phone} />,
    },
    {
      key:    'email',
      header: 'Email',
      render: (s) => <OptionalCell value={s.email} />,
    },
    {
      key:    'address',
      header: 'Address',
      render: (s) => <OptionalCell value={s.address} />,
    },
    {
      key:    'actions',
      header: '',
      align:  'right',
      width:  '90px',
      render: (s) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          {/* Tooltip wraps edit directly — no Popconfirm conflict */}
          <Tooltip title="Edit">
            <IconButton onClick={() => onEdit(s)}>
              <Pencil size={13} />
            </IconButton>
          </Tooltip>

          {/* Tooltip on the OUTSIDE of Popconfirm so Popconfirm gets
              a clean ref to IconButton without interference */}
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this supplier?"
              description="This cannot be undone."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(s.id)}
            >
              <IconButton danger loading={deleting === s.id}>
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
        keyExtractor={(s) => String(s.id)}
        loading={loading}
        emptyMessage={
          search
            ? 'No suppliers match your search.'
            : 'No suppliers yet. Add your first one.'
        }
        pageSize={15}
      />
    </div>
  );
};

export default SuppliersTable;