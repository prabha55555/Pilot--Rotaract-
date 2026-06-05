import React, { forwardRef } from 'react';

/**
 * Input Component - Concept B
 */
export const Input = forwardRef(({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(7);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-main">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`
            w-full bg-white border rounded-xl text-sm transition-all duration-200
            px-4 py-2 text-text-main placeholder:text-text-light
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-transparent
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-semantic-error focus-visible:ring-semantic-error' : 'border-surface-border hover:border-text-light'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-semantic-error mt-0.5">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
