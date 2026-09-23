'use client';

import React from 'react';
import { Search, Calendar, Filter } from 'lucide-react';

interface HistoryFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  period: 'today' | '7days' | '30days' | 'all';
  onPeriodChange: (val: 'today' | '7days' | '30days' | 'all') => void;
  ratingFilter: number;
  onRatingFilterChange: (val: number) => void;
}

export function HistoryFilterBar({
  search,
  onSearchChange,
  period,
  onPeriodChange,
  ratingFilter,
  onRatingFilterChange,
}: HistoryFilterBarProps) {
  const ratings = [
    { value: 0, label: 'Todos os Ratings' },
    { value: 1, label: 'Again (Erros)', color: 'text-red-600' },
    { value: 2, label: 'Hard (Difícil)', color: 'text-amber-600' },
    { value: 3, label: 'Good (Bom)', color: 'text-emerald-600' },
    { value: 4, label: 'Easy (Fácil)', color: 'text-blue-600' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Busca por Pergunta ou Disciplina */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por pergunta, baralho ou assunto..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Seletor de Período */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          {[
            { id: 'today', label: 'Hoje' },
            { id: '7days', label: '7 Dias' },
            { id: '30days', label: '30 Dias' },
            { id: 'all', label: 'Tudo' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPeriodChange(item.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === item.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro por Rating FSRS */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Rating:
        </span>
        {ratings.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => onRatingFilterChange(r.value)}
            className={`px-2.5 py-1 rounded-lg border transition-all text-xs font-medium ${
              ratingFilter === r.value
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
