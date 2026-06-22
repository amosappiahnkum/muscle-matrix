import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col } from 'antd';
import { Product } from '@/types';
import Modal from '@/components/common/Modal';
import { ErrorBanner } from '@/components/common/Banner';
import Button from '@/components/common/Button';
import ExpiryDateInput from './ExpiryDateInput';

// ─── Form state type ──────────────────────────────────────────────────────────
export interface ProductFormData {
  name:           string;
  quantity:       string;
  expiryDate:     string;
  costPrice:      string;
  wholesalePrice: string;
  retailPrice:    string;
}

export const defaultForm: ProductFormData = {
  name:           '',
  quantity:       '',
  expiryDate:     '',
  costPrice:      '',
  wholesalePrice: '',
  retailPrice:    '',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProductFormProps {
  open:     boolean;
  editing:  Product | null;
  loading:  boolean;
  error:    string;
  onClose:  () => void;
  onSubmit: (data: ProductFormData) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ProductForm: React.FC<ProductFormProps> = ({
  open, editing, loading, error, onClose, onSubmit,
}) => {
  const [form] = Form.useForm<ProductFormData>();

  // Pre-fill when opening the edit modal
  useEffect(() => {
    form.setFieldsValue(
      editing
        ? {
            name:           editing.name,
            quantity:       editing.quantity.toString(),
            expiryDate:     editing.expiryDate
                              ? new Date(editing.expiryDate).toISOString().split('T')[0]
                              : '',
            costPrice:      editing.costPrice.toString(),
            wholesalePrice: editing.wholesalePrice.toString(),
            retailPrice:    editing.retailPrice.toString(),
          }
        : defaultForm
    );
  }, [editing, open, form]);

  const expiryDate = Form.useWatch('expiryDate', form) ?? '';

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    onSubmit(values);
  };

  const priceFields: { key: keyof ProductFormData; label: string }[] = [
    { key: 'costPrice',      label: 'Cost Price (GH₵)' },
    { key: 'wholesalePrice', label: 'Wholesale Price (GH₵)' },
    { key: 'retailPrice',    label: 'Retail Price (GH₵)' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Product' : 'Add New Product'}
      persistent={loading}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        {error && (
          <div style={{ marginBottom: 16 }}>
            <ErrorBanner message={error} />
          </div>
        )}

        {/* Product name */}
        <Form.Item label="Product Name" name="name">
          <Input
            disabled={loading}
            placeholder="Enter product name"
            size="large"
          />
        </Form.Item>

        {/* Quantity */}
        <Form.Item label="Quantity Available" name="quantity">
          <InputNumber
            min={0}
            disabled={loading}
            placeholder="Enter quantity"
            size="large"
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* Prices */}
        <Row gutter={16}>
          {priceFields.map(({ key, label }) => (
            <Col xs={24} sm={8} key={key}>
              <Form.Item label={label} name={key}>
                <InputNumber
                  min={0}
                  step={0.01}
                  precision={2}
                  disabled={loading}
                  placeholder="0.00"
                  size="large"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>

        {/* Expiry date */}
        <Form.Item name="expiryDate">
          <ExpiryDateInput
            value={expiryDate}
            onChange={(val) => form.setFieldValue('expiryDate', val)}
            disabled={loading}
            isEditing={!!editing}
          />
        </Form.Item>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            color="orange"
            size="lg"
            fullWidth
            loading={loading}
            onClick={handleSubmit}
          >
            {editing ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ProductForm;