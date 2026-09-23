'use client';

import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface DeckFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedDisciplina: string;
  onDisciplinaChange: (val: string) => void;
  disciplinas: string[];
  selectedBanca: string;
  onBancaChange: (val: string) => void;
  bancas: string[];
  sortBy: 'recent' | 'due' | 'name';
  onSortByChange: (val: 'recent' | 'due' | 'name') => void;
  showArchived: boolean;
  onToggleArchived: (val: boolean) => void;
}

export function DeckFilterBar({
  search,
  onSearchChange,
  selectedDisciplina,
  onDisciplinaChange,
  disciplinas,
  selectedBanca,
  onBancaChange,
  bancas,
  sortBy,
  onSortByChange,
  showArchived,
  onToggleArchived,
}: DeckFilterBarProps) {
  return (
    <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Campo de Busca Livre */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por título, assunto, concurso ou tag..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Abas Ativos / Arquivados */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onToggleArchived(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !showArchived
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Ativos
          </button>
          <button
            type="button"
            onClick={() => onToggleArchived(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showArchived
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Arquivados
          </button>
        </div>
      </div>

      {/* Linha de Filtros Rápidos e Ordenação */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtros:</span>
        </div>

        {/* Filtro por Disciplina */}
        <select
          value={selectedDisciplina}
          onChange={(e) => onDisciplinaChange(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="">Todas as Disciplinas</option>
          {disciplinas.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Filtro por Banca */}
        {bancas.length > 0 && (
          <select
            value={selectedBanca}
            onChange={(e) => onBancaChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">Todas as Bancas</option>
            {bancas.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}

        {/* Ordenação */}
        <div className="ml-auto flex items-center gap-1.5 text-slate-500">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="recent">Mais Recentes</option>
            <option value="due">Mais a Revisar</option>
            <option value="name">Ordem Alfabética</option>
          </select>
        </div>
      </div>
    </div>
  );
}
