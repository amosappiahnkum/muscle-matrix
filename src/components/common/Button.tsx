import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';
type Color   = 'blue' | 'green' | 'orange' | 'red' | 'gray';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  color?:    Color;
  loading?:  boolean;
  icon?:     React.ReactNode;
  fullWidth?: boolean;
}

const colorMap: Record<Color, Record<'primary' | 'ghost', string>> = {
  blue:   { primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-100 text-white focus:ring-blue-500',
            ghost:   'text-blue-600 hover:bg-blue-50 border-blue-200 hover:border-blue-300' },
  green:  { primary: 'bg-green-600 hover:bg-green-700 disabled:bg-green-100 text-white focus:ring-green-500',
            ghost:   'text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300' },
  orange: { primary: 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-100 text-white focus:ring-orange-500',
            ghost:   'text-orange-500 hover:bg-orange-50 border-orange-200 hover:border-orange-300' },
  red:    { primary: 'bg-red-600 hover:bg-red-700 disabled:bg-red-100 text-white focus:ring-red-500',
            ghost:   'text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300' },
  gray:   { primary: 'bg-gray-800 hover:bg-gray-900 disabled:bg-gray-100 text-white focus:ring-gray-500',
            ghost:   'text-gray-600 hover:bg-gray-100 border-gray-200 hover:border-gray-300' },
};

const sizeMap: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const Button: React.FC<ButtonProps> = ({
  variant   = 'primary',
  size      = 'md',
  color     = 'gray',
  loading   = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...rest
}) => {
  const base = [
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg',
    'transition-all duration-150 border',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
  ].join(' ');

  const variantClass =
    variant === 'primary'   ? `${colorMap[color].primary} border-transparent shadow-sm` :
    variant === 'secondary' ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm focus:ring-gray-400' :
    variant === 'danger'    ? 'bg-red-600 text-white border-transparent hover:bg-red-700 shadow-sm focus:ring-red-500' :
    /* ghost */               `bg-transparent border ${colorMap[color].ghost}`;

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variantClass} ${sizeMap[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
};

export default Button;