import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-soft hover:shadow-medium';
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 focus:ring-orange-500 shadow-orange-200 hover:shadow-orange-300',
    secondary: 'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 text-gray-800 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 focus:ring-gray-500 shadow-gray-200 border border-gray-300',
    danger: 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800 focus:ring-red-500 shadow-red-200 hover:shadow-red-300',
    success: 'bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white hover:from-green-600 hover:via-green-700 hover:to-green-800 focus:ring-green-500 shadow-green-200 hover:shadow-green-300',
    outline: 'border-2 border-orange-300 text-orange-700 bg-white hover:bg-orange-50 hover:border-orange-400 focus:ring-orange-500 hover:text-orange-800',
    ghost: 'text-orange-600 hover:bg-orange-50 focus:ring-orange-500 hover:text-orange-700'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-3',
    xl: 'px-10 py-5 text-lg gap-3'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : icon ? (
        <span className="flex items-center">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;