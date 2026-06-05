import React from 'react';

/**
 * Badge Component - Concept B
 * Soft pill shapes.
 */
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-surface-muted text-text-main',
    brand: 'bg-brand-light text-brand',
    success: 'bg-semantic-successLight text-semantic-success',
    warning: 'bg-semantic-warningLight text-semantic-warning',
    error: 'bg-semantic-errorLight text-semantic-error',
    // Specific business logic variants for quick mapping
    draft: 'bg-surface-muted text-text-muted',
    submitted: 'bg-brand-light text-brand',
    reviewed: 'bg-semantic-successLight text-semantic-success',
  };

  const selectedVariant = variants[variant.toLowerCase()] || variants.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
};
