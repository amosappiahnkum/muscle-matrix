import React from 'react';

export const inputCls = `w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
  text-gray-900 placeholder-gray-400 text-sm
  focus:outline-none focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100
  transition-all disabled:opacity-50`;

interface ExpiryDateInputProps {
  value:      string;        // YYYY-MM-DD or ''
  onChange:   (val: string) => void;
  disabled?:  boolean;
  isEditing?: boolean;       // skip min-date enforcement when editing an existing product
}

/**
 * Expiry date field with colour-coded hint text.
 *
 * Hint is computed from the raw date string (not from Product.isExpired /
 * Product.isExpiringSoon) because those flags only exist on saved records,
 * not on transient form state.
 *
 * min-date is only applied when creating a new product so that editing a
 * product that already has a past expiry date isn't blocked.
 */
const ExpiryDateInput: React.FC<ExpiryDateInputProps> = ({
  value,
  onChange,
  disabled  = false,
  isEditing = false,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const daysRemaining = value
    ? Math.ceil((new Date(value).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const expired      = daysRemaining !== null && daysRemaining < 0;
  const expiringSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 30;

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        Expiry Date
        <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
      </label>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={!isEditing ? todayStr : undefined}
        className={`${inputCls} ${expired ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
      />

      {daysRemaining !== null && (
        expired ? (
          <p className="text-xs text-red-500 mt-1">⚠ This product has already expired</p>
        ) : expiringSoon ? (
          <p className="text-xs text-yellow-600 mt-1">
            ⚠ Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
          </p>
        ) : (
          <p className="text-xs text-green-600 mt-1">
            ✓ Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
          </p>
        )
      )}
    </div>
  );
};

export default ExpiryDateInput;