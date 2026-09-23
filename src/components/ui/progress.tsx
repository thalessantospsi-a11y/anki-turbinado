import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 a 100
  max?: number;
  indicatorColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Progress({
  value,
  max = 100,
  indicatorColor = 'bg-blue-600',
  size = 'md',
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
          sizeClasses[size],
          className
        )
      )}
      {...props}
    >
      <div
        className={twMerge(
          clsx('h-full transition-all duration-500 ease-out rounded-full', indicatorColor)
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
