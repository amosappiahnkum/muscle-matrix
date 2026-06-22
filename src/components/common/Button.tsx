import React from 'react';
import { Button as AntButton, ConfigProvider } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';
type Color   = 'blue' | 'green' | 'orange' | 'red' | 'gray';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?:   Variant;
  size?:      Size;
  color?:     Color;
  loading?:   boolean;
  icon?:      React.ReactNode;
  fullWidth?: boolean;
}

// Map custom color tokens to hex for ConfigProvider theming
const colorTokenMap: Record<Color, string> = {
  blue:   '#2563eb',
  green:  '#16a34a',
  orange: '#f97316',
  red:    '#dc2626',
  gray:   '#1f2937',
};

// Map custom size to Ant Design size + inline padding overrides
const sizeMap: Record<Size, { antSize: AntButtonProps['size']; style: React.CSSProperties }> = {
  sm: { antSize: 'small',  style: { fontSize: 12, padding: '0 12px', height: 28 } },
  md: { antSize: 'middle', style: { fontSize: 14, padding: '0 16px', height: 36 } },
  lg: { antSize: 'large',  style: { fontSize: 16, padding: '0 24px', height: 48 } },
};

// Map variant → Ant Design type + danger flag
function getAntProps(variant: Variant): Pick<AntButtonProps, 'type' | 'danger'> {
  switch (variant) {
    case 'primary':   return { type: 'primary' };
    case 'secondary': return { type: 'default' };
    case 'danger':    return { type: 'primary', danger: true };
    case 'ghost':     return { type: 'default' };
  }
}

const Button: React.FC<ButtonProps> = ({
  variant   = 'primary',
  size      = 'md',
  color     = 'gray',
  loading   = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  style,
  ...rest
}) => {
  const { antSize, style: sizeStyle } = sizeMap[size];
  const { type, danger }              = getAntProps(variant);
  const primaryColor                  = colorTokenMap[color];

  // Ghost variant needs a transparent background — Ant's "text" type
  // is the closest, but we keep "default" + inline override for border parity.
  const isGhost = variant === 'ghost';

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary:      primaryColor,
          colorPrimaryHover: primaryColor,
          borderRadius:      8,
          fontWeight:        600,
        },
      }}
    >
      <AntButton
        type={type}
        danger={danger}
        size={antSize}
        loading={loading}
        disabled={disabled}
        icon={!loading ? icon : undefined}
        block={fullWidth}
        style={{
          ...sizeStyle,
          fontWeight: 600,
          ...(isGhost ? {
            background:  'transparent',
            color:       primaryColor,
            borderColor: primaryColor,
          } : {}),
          ...style,
        }}
        {...(rest as Omit<AntButtonProps, 'color'>)}
      >
        {children}
      </AntButton>
    </ConfigProvider>
  );
};

export default Button;