'use client';

import React from 'react';
import { QuestionFilters } from '@/services/firestore/questionRepository';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionFilterPanelProps {
  filters: QuestionFilters;
  onChange: (filters: QuestionFilters) => void;
  disciplinas: string[];
  bancas: string[];
}

export function QuestionFilterPanel({
  filters,
  onChange,
  disciplinas,
  bancas,
}: QuestionFilterPanelProps) {
  const handleClear = () => {
    onChange({});
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          Filtros de Questões
        </span>
        <button
          type="button"
          onClick={handleClear}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Limpar Filtros
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* Disciplina */}
        <select
          value={filters.disciplina || ''}
          onChange={(e) => onChange({ ...filters, disciplina: e.target.value || undefined })}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none"
        >
          <option value="">Todas as Disciplinas</option>
          {disciplinas.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Banca */}
        <select
          value={filters.banca || ''}
          onChange={(e) => onChange({ ...filters, banca: e.target.value || undefined })}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none"
        >
          <option value="">Todas as Bancas</option>
          {bancas.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Dificuldade */}
        <select
          value={filters.difficulty || ''}
          onChange={(e) => onChange({ ...filters, difficulty: (e.target.value as any) || undefined })}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none"
        >
          <option value="">Qualquer Dificuldade</option>
          <option value="easy">Fácil</option>
          <option value="medium">Média</option>
          <option value="hard">Difícil</option>
        </select>

        {/* Favoritas */}
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={Boolean(filters.isFavorite)}
            onChange={(e) => onChange({ ...filters, isFavorite: e.target.checked || undefined })}
            className="w-3.5 h-3.5 text-blue-600 rounded"
          />
          <span>Apenas Favoritas</span>
        </label>
      </div>
    </div>
  );
}
