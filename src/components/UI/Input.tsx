import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  success,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full group">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-orange-600 transition-colors duration-200">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className={`transition-colors duration-200 ${
              error ? 'text-red-500' : success ? 'text-green-500' : 'text-gray-400 group-focus-within:text-orange-500'
            }`}>
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full px-4 py-4 border-2 rounded-2xl shadow-sm transition-all duration-300 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-1 
            ${leftIcon ? 'pl-12' : 'pl-4'}
            ${rightIcon || error || success ? 'pr-12' : 'pr-4'}
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
              : success 
                ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50/50'
                : 'border-gray-200 hover:border-orange-300 focus:ring-orange-500 focus:border-orange-500 bg-white'
            }
            hover:shadow-md focus:shadow-lg
            ${className}
          `}
          {...props}
        />
        
        {(rightIcon || error || success) && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {error ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <span className="text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200">
                {rightIcon}
              </span>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-3 flex items-start space-x-2 animate-slideIn">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500 flex items-center space-x-2">
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{helperText}</span>
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;