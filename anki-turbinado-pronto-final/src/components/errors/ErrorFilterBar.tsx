'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ErrorFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  reasonFilter: string;
  onReasonFilterChange: (val: string) => void;
  onlyPendingCards: boolean;
  onTogglePendingCards: (val: boolean) => void;
  selectedDisciplina: string;
  onDisciplinaChange: (val: string) => void;
  disciplinas: string[];
}

export function ErrorFilterBar({
  search,
  onSearchChange,
  reasonFilter,
  onReasonFilterChange,
  onlyPendingCards,
  onTogglePendingCards,
  selectedDisciplina,
  onDisciplinaChange,
  disciplinas,
}: ErrorFilterBarProps) {
  const reasons = [
    { id: 'all', label: 'Todos os Motivos' },
    { id: 'nao_sabia', label: 'Não sabia' },
    { id: 'confundi_conceitos', label: 'Confundi conceitos' },
    { id: 'atencao', label: 'Atenção' },
    { id: 'pegadinha', label: 'Pegadinha' },
    { id: 'interpretacao', label: 'Interpretação' },
    { id: 'esqueci', label: 'Esqueci' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por enunciado, assunto ou banca..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Toggle Pendentes de Flashcard */}
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={onlyPendingCards}
            onChange={(e) => onTogglePendingCards(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span>Apenas Pendentes de Card FSRS</span>
        </label>
      </div>

      {/* Linha de Motivos e Disciplinas */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Motivo:
        </span>

        {reasons.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onReasonFilterChange(r.id)}
            className={`px-2.5 py-1 rounded-lg border transition-all text-xs font-medium ${
              reasonFilter === r.id
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {r.label}
          </button>
        ))}

        {disciplinas.length > 0 && (
          <div className="ml-auto">
            <select
              value={selectedDisciplina}
              onChange={(e) => onDisciplinaChange(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">Todas as Disciplinas</option>
              {disciplinas.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
