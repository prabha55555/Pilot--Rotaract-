import React from 'react';
import { Button } from './Button';

/**
 * EmptyState Component - Concept B
 */
export const EmptyState = ({ icon, title, description, actionLabel, onAction, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-surface border border-dashed border-surface-border rounded-2xl ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-text-light mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-main font-outfit mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
