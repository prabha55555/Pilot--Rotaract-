import React from 'react';
import { Card } from './Card';

/**
 * StatCard Component - Concept B
 */
export const StatCard = ({ title, value, icon: Icon, trend, trendValue, className = '' }) => {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    return <Icon size={20} />;
  };

  return (
    <Card className={`flex flex-col gap-4 ${className}`}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-text-muted">{title}</p>
        {Icon && (
          <div className="p-2 bg-surface-muted rounded-lg text-brand">
            {renderIcon()}
          </div>
        )}
      </div>
      <div>
        <h4 className="text-3xl font-semibold font-outfit text-text-main">{value}</h4>
        {trend && trendValue && (
          <p className={`text-sm mt-1 flex items-center gap-1 ${
            trend === 'up' ? 'text-semantic-success' : 
            trend === 'down' ? 'text-semantic-error' : 'text-text-muted'
          }`}>
            <span>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
            </span>
            {trendValue}
          </p>
        )}
      </div>
    </Card>
  );
};
