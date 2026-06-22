import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Package, ArrowRight, Layers, Calendar, User, FileText, Hash } from 'lucide-react';
import { Descriptions, Table, Typography, Tag, Statistic, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { InventoryEntry } from '@/types';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { TypeBadge } from './TypeBadge';
import { ChangeBadge } from './ChangeBadge';

const { Text, Title } = Typography;

interface BatchProductItem {
  productId:   string;
  productName: string | null;
  quantity:    number;
  unitCost:    number;
  totalCost:   number;
}

interface BatchInfo {
  id:          string;
  batchCode:   string;
  name?:       string | null;
  supplier?:   string | null;
  expiryDate?: string | null;
  products?:   BatchProductItem[];
}

interface DetailModalProps {
  entry:    InventoryEntry | null;
  batches?: BatchInfo[];
  onClose:  () => void;
}

// ── Aside panel ───────────────────────────────────────────
const EntryAside: React.FC<{ entry: InventoryEntry; batch?: BatchInfo }> = ({ entry, batch }) => (
  <div className="flex flex-col gap-5 h-full">

    {/* Product name + type */}
    <div>
      {entry.batchCode && (
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-1">
          {batch?.name ?? entry.batchCode}
        </span>
      )}
      <Title level={5} style={{ margin: 0, color: '#111827', lineHeight: 1.35 }}>
        {entry.productName}
      </Title>
      <div className="mt-2">
        <TypeBadge type={entry.type} />
      </div>
    </div>

    <Divider style={{ margin: '0' }} />

    {/* Stock movement */}
    <div>
      <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
        Stock Movement
      </Text>
      <div className="flex items-center justify-between gap-2">
        <div className="text-center">
          <Text type="secondary" className="text-xs block mb-1">Before</Text>
          <Statistic
            value={entry.quantityBefore}
            valueStyle={{ fontSize: 28, fontWeight: 900, color: '#6b7280' }}
          />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <ArrowRight size={16} color="#d1d5db" />
          <ChangeBadge change={entry.quantityChange} />
        </div>
        <div className="text-center">
          <Text type="secondary" className="text-xs block mb-1">After</Text>
          <Statistic
            value={entry.quantityAfter}
            valueStyle={{ fontSize: 28, fontWeight: 900, color: '#111827' }}
          />
        </div>
      </div>
    </div>

    <Divider style={{ margin: '0' }} />

    {/* Meta rows */}
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <Calendar size={13} className="text-gray-400 mt-0.5 shrink-0" />
        <div>
          <Text className="text-[11px] text-gray-400 block">Date</Text>
          <Text className="text-xs font-medium text-gray-700">
            {format(parseISO(entry.createdAt), 'dd MMM yyyy, HH:mm')}
          </Text>
        </div>
      </div>

      {entry.createdBy && (
        <div className="flex items-start gap-2.5">
          <User size={13} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <Text className="text-[11px] text-gray-400 block">Recorded by</Text>
            <Text className="text-xs font-medium text-gray-700">{entry.createdBy}</Text>
          </div>
        </div>
      )}

      {entry.batchCode && (
        <div className="flex items-start gap-2.5">
          <Hash size={13} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <Text className="text-[11px] text-gray-400 block">Batch Code</Text>
            <Text code className="text-blue-600 text-xs">{entry.batchCode}</Text>
          </div>
        </div>
      )}

      {entry.note && (
        <div className="flex items-start gap-2.5">
          <FileText size={13} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <Text className="text-[11px] text-gray-400 block">Note</Text>
            <Text className="text-xs text-gray-600 italic">{entry.note}</Text>
          </div>
        </div>
      )}
    </div>

    {/* Batch meta at bottom */}
    {batch && (batch.supplier || batch.expiryDate) && (
      <>
        <div className="flex-1" />
        <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100">
          {batch.supplier && (
            <Text type="secondary" className="text-xs">
              📦 {batch.supplier}
            </Text>
          )}
          {batch.expiryDate && (
            <Text type="secondary" className="text-xs">
              ⏳ Expires {format(parseISO(batch.expiryDate), 'dd MMM yyyy')}
            </Text>
          )}
        </div>
      </>
    )}
  </div>
);

// ── Main modal ────────────────────────────────────────────
const DetailModal: React.FC<DetailModalProps> = ({ entry, batches = [], onClose }) => {
  const navigate = useNavigate();

  if (!entry) return null;

  const batch = entry.batchCode
    ? batches.find(b => b.batchCode === entry.batchCode)
    : undefined;

  const batchColumns: ColumnsType<BatchProductItem> = [
    {
      title:     'Product',
      dataIndex: 'productName',
      key:       'productName',
      render:    (name: string | null, row) => (
        <span>
          <Text strong={row.productId === entry.productId}>
            {name ?? 'Product'}
          </Text>
          {row.productId === entry.productId && (
            <Tag color="orange" style={{ marginLeft: 8, fontSize: 10, lineHeight: '16px' }}>
              this
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: 'Qty', dataIndex: 'quantity', key: 'quantity',
      align: 'center', width: 72,
    },
    {
      title: 'Unit Cost', dataIndex: 'unitCost', key: 'unitCost',
      align: 'right', width: 110,
      render: (v: number) => <>GH&#8373;{v.toFixed(2)}</>,
    },
    {
      title: 'Total', dataIndex: 'totalCost', key: 'totalCost',
      align: 'right', width: 110,
      render: (v: number) => <Text strong>GH&#8373;{v.toFixed(2)}</Text>,
    },
  ];

  return (
    <Modal
      open={!!entry}
      onClose={onClose}
      title=""
      maxWidth="2xl"
      aside={<EntryAside entry={entry} batch={batch} />}
    >
      <div className="flex flex-col gap-5">

        {/* Product detail */}
        <div>
          <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
            Product Details
          </Text>
          <Descriptions
            column={1}
            size="small"
            labelStyle={{ color: '#9ca3af', fontSize: 12, width: 110 }}
            contentStyle={{ color: '#1f2937', fontSize: 13, fontWeight: 500 }}
          >
            <Descriptions.Item label="Product">
              <span className="flex items-center gap-1.5">
                <Package size={13} color="#9ca3af" />
                {entry.productName}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <TypeBadge type={entry.type} />
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {format(parseISO(entry.createdAt), 'dd MMM yyyy, HH:mm')}
            </Descriptions.Item>
            {entry.createdBy && (
              <Descriptions.Item label="Recorded by">{entry.createdBy}</Descriptions.Item>
            )}
            {entry.batchCode && (
              <Descriptions.Item label="Batch Code">
                <Text code className="text-blue-600">{entry.batchCode}</Text>
              </Descriptions.Item>
            )}
            {entry.note && (
              <Descriptions.Item label="Note">
                <Text type="secondary" className="italic text-sm">{entry.note}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        {/* Batch products table */}
        {batch && (
          <>
            <Divider style={{ margin: '4px 0' }} />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-gray-400" />
                  <Text strong className="text-sm text-gray-700">
                    Products in this batch
                  </Text>
                </div>
                <Button
                  variant="ghost"
                  color="orange"
                  size="sm"
                  onClick={() => navigate(`/admin/batches/${batch.id}`)}
                >
                  Edit batch
                </Button>
              </div>

              <Table
                columns={batchColumns}
                dataSource={batch.products ?? []}
                rowKey="productId"
                size="small"
                pagination={false}
                locale={{ emptyText: 'No product breakdown available for this batch.' }}
                rowClassName={(row) =>
                  row.productId === entry.productId ? 'batch-row--active' : ''
                }
              />
            </div>
          </>
        )}

        {/* No batch — simple edit CTA */}
        {!batch && (
          <>
            <Divider style={{ margin: '4px 0' }} />
            <div className="flex justify-end">
              <Button
                variant="ghost"
                color="orange"
                size="sm"
                onClick={() => navigate(`/admin/products/${entry.productId}`)}
              >
                Edit product →
              </Button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .batch-row--active td { background: #fff7ed !important; }
        .batch-row--active:hover td { background: #ffedd5 !important; }
      `}</style>
    </Modal>
  );
};

export default DetailModal;