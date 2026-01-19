'use client';

import React from 'react';

/**
 * Stats Card Component Props
 */
interface StatsCardProps {
  title: string;
  value: any;
  icon: any;
  trend?: string;
  trendValue?: string;
  color?: 'primary' | 'green' | 'red' | 'purple';
  onClick?: () => void;
}

/**
 * Stats Card Component
 * Displays a single statistic with icon
 */
export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'primary',
  onClick
}: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary-500/10 text-primary-500',
    green: 'bg-accent-green/10 text-accent-green',
    red: 'bg-accent-red/10 text-accent-red',
    purple: 'bg-secondary-500/10 text-secondary-500',
  };

  return (
    <div 
      className={`card p-6 transition-all duration-200 hover:shadow-lg ${
        onClick ? 'cursor-pointer hover:border-primary-500/50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
          <p className="text-3xl font-bold text-text">{value}</p>
          
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-accent-green' : 'text-accent-red'
              }`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-sm text-text-muted">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
}

