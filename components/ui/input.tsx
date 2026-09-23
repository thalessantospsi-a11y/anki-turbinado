'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={twMerge(
          clsx(
            'w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all',
            error
              ? 'border-red-500 focus:ring-red-400/50'
              : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20',
            className
          )
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
      {helperText && !error && (
        <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>
      )}
    </div>
  );
}
