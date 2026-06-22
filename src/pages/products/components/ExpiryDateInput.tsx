import React from 'react';
import { DatePicker, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

interface ExpiryDateInputProps {
  value:      string;        // YYYY-MM-DD or ''
  onChange:   (val: string) => void;
  disabled?:  boolean;
  isEditing?: boolean;
}

const ExpiryDateInput: React.FC<ExpiryDateInputProps> = ({
  value,
  onChange,
  disabled  = false,
  isEditing = false,
}) => {
  const today = dayjs().startOf('day');

  const daysRemaining = value
    ? dayjs(value).startOf('day').diff(today, 'day')
    : null;

  const expired      = daysRemaining !== null && daysRemaining < 0;
  const expiringSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 30;

  const handleChange = (date: Dayjs | null) => {
    onChange(date ? date.format('YYYY-MM-DD') : '');
  };

  const disabledDate = (date: Dayjs) =>
    !isEditing ? date.isBefore(today, 'day') : false;

  // Derive status for Ant Design's built-in border colouring
  const status = expired ? 'error' : expiringSoon ? 'warning' : undefined;

  const hint =
    daysRemaining === null ? null :
    expired      ? { color: 'danger'  as const, text: '⚠ This product has already expired' } :
    expiringSoon ? { color: 'warning' as const, text: `⚠ Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}` } :
                   { color: 'success' as const, text: `✓ Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}` };

  return (
    <div>
      <DatePicker
        value={value ? dayjs(value) : null}
        onChange={handleChange}
        disabled={disabled}
        disabledDate={!isEditing ? disabledDate : undefined}
        status={status}
        format="YYYY-MM-DD"
        placeholder="Select expiry date"
        size="large"
        style={{ width: '100%' }}
      />

      {hint && (
        <Text
          type={hint.color}
          style={{ display: 'block', fontSize: 12, marginTop: 4 }}
        >
          {hint.text}
        </Text>
      )}
    </div>
  );
};

export default ExpiryDateInput;