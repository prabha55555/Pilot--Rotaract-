import React from 'react';

/**
 * Card Component - Concept B (Stripe/Framer inspired)
 * Features soft diffused shadows and generous rounded corners.
 */
export const Card = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div
      className={`bg-surface rounded-2xl shadow-stripe border border-surface-border ${
        noPadding ? '' : 'p-6'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 ${className}`}>
    <div>
      <h3 className="text-xl font-semibold text-text-main font-outfit">{title}</h3>
      {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
