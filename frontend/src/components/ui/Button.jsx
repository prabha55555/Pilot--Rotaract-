import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button Component - Concept B
 */
export const Button = ({
  children,
  variant = 'primary', // primary | secondary | ghost | danger
  size = 'md', // sm | md | lg
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand text-white hover:bg-[#003080] shadow-sm active:scale-[0.98]',
    secondary: 'bg-white text-text-main border border-surface-border hover:bg-surface-muted shadow-sm active:scale-[0.98]',
    ghost: 'bg-transparent text-text-muted hover:text-text-main hover:bg-surface-muted',
    danger: 'bg-semantic-error text-white hover:bg-red-600 shadow-sm active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};
