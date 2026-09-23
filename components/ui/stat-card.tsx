import React from 'react';
import { Card } from './card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlightColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlightColor = 'text-blue-600 dark:text-blue-400',
}: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className={`text-2xl sm:text-3xl font-black tracking-tight ${highlightColor}`}>
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {trend.isPositive ? '▲' : '▼'} {trend.value}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}
