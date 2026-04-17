import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';
type Color   = 'blue' | 'green' | 'orange' | 'red' | 'gray';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  color?: Color;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const colorMap: Record<Color, Record<'primary' | 'ghost', string>> = {
  blue:   { primary: 'bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900',   ghost: 'text-blue-400 hover:bg-blue-500/10' },
  green:  { primary: 'bg-green-600 hover:bg-green-500 disabled:bg-green-900', ghost: 'text-green-400 hover:bg-green-500/10' },
  orange: { primary: 'bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900', ghost: 'text-orange-400 hover:bg-orange-500/10' },
  red:    { primary: 'bg-red-600 hover:bg-red-500 disabled:bg-red-900',      ghost: 'text-red-400 hover:bg-red-500/10' },
  gray:   { primary: 'bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800',   ghost: 'text-gray-400 hover:bg-gray-500/10' },
};

const sizeMap: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  color = 'gray',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...rest
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';

  const variantClass =
    variant === 'primary'   ? `text-white ${colorMap[color].primary}` :
    variant === 'secondary' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800' :
    variant === 'danger'    ? 'bg-red-600 text-white hover:bg-red-500 disabled:bg-red-900' :
    /* ghost */               `bg-transparent ${colorMap[color].ghost}`;

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
