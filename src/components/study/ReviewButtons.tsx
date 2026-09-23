'use client';

import React from 'react';
import { FSRSRating } from '@/types';
import { FSRSNextIntervals } from '@/core/fsrs/types';
import { formatIntervalLabel } from '@/core/fsrs/scheduler';

interface ReviewButtonsProps {
  intervals: FSRSNextIntervals | null;
  onRate: (rating: FSRSRating) => void;
  disabled?: boolean;
}

export function ReviewButtons({ intervals, onRate, disabled }: ReviewButtonsProps) {
  const againLabel = intervals ? formatIntervalLabel(intervals.again.intervalDays) : '10m';
  const hardLabel = intervals ? formatIntervalLabel(intervals.hard.intervalDays) : '1d';
  const goodLabel = intervals ? formatIntervalLabel(intervals.good.intervalDays) : '4d';
  const easyLabel = intervals ? formatIntervalLabel(intervals.easy.intervalDays) : '10d';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-2xl mx-auto w-full">
      {/* 1: AGAIN */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRate(1)}
        className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-bold transition-all transform active:scale-95 shadow-sm group"
      >
        <span className="text-xs uppercase tracking-wider text-red-500 font-semibold group-hover:text-red-600">
          Again
        </span>
        <span className="text-base sm:text-lg font-black mt-0.5">{againLabel}</span>
        <span className="text-[10px] text-red-400 font-mono mt-1 bg-red-100 dark:bg-red-900/60 px-1.5 py-0.5 rounded">
          Teclado: 1
        </span>
      </button>

      {/* 2: HARD */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRate(2)}
        className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold transition-all transform active:scale-95 shadow-sm group"
      >
        <span className="text-xs uppercase tracking-wider text-amber-500 font-semibold group-hover:text-amber-600">
          Hard
        </span>
        <span className="text-base sm:text-lg font-black mt-0.5">{hardLabel}</span>
        <span className="text-[10px] text-amber-400 font-mono mt-1 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
          Teclado: 2
        </span>
      </button>

      {/* 3: GOOD */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRate(3)}
        className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold transition-all transform active:scale-95 shadow-sm group ring-2 ring-emerald-500/20"
      >
        <span className="text-xs uppercase tracking-wider text-emerald-600 font-semibold group-hover:text-emerald-700">
          Good
        </span>
        <span className="text-base sm:text-lg font-black mt-0.5">{goodLabel}</span>
        <span className="text-[10px] text-emerald-500 font-mono mt-1 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
          Teclado: 3
        </span>
      </button>

      {/* 4: EASY */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRate(4)}
        className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold transition-all transform active:scale-95 shadow-sm group"
      >
        <span className="text-xs uppercase tracking-wider text-blue-500 font-semibold group-hover:text-blue-600">
          Easy
        </span>
        <span className="text-base sm:text-lg font-black mt-0.5">{easyLabel}</span>
        <span className="text-[10px] text-blue-400 font-mono mt-1 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
          Teclado: 4
        </span>
      </button>
    </div>
  );
}
