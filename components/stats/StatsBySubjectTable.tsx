'use client';

import React, { useState, useMemo } from 'react';
import { SubjectStatItem } from '@/hooks/useDetailedStats';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowUpDown, AlertCircle } from 'lucide-react';

interface StatsBySubjectTableProps {
  subjects: SubjectStatItem[];
}

export function StatsBySubjectTable({ subjects }: StatsBySubjectTableProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'accuracy' | 'questions' | 'cards' | 'lapses'>('questions');

  const filtered = useMemo(() => {
    return subjects
      .filter((s) => {
        const q = search.toLowerCase();
        return s.disciplina.toLowerCase().includes(q) || s.assunto.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'accuracy') return a.accuracyRate - b.accuracyRate; // piores primeiro
        if (sortBy === 'cards') return b.cardsTotal - a.cardsTotal;
        if (sortBy === 'lapses') return b.averageLapses - a.averageLapses;
        return b.questionsTotal - a.questionsTotal;
      });
  }, [subjects, search, sortBy]);

  if (subjects.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
        Nenhum dado por assunto disponível ainda. Crie cartões ou resolva questões.
      </div>
    );
  }

  return (
    <Card className="p-5 space-y-4 border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por disciplina ou assunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none"
          >
            <option value="questions">Mais Questões</option>
            <option value="accuracy">Menor Taxa de Acerto</option>
            <option value="lapses">Mais Lapsos</option>
            <option value="cards">Mais Flashcards</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Disciplina / Assunto</th>
              <th className="py-3 px-4">Questões Respondidas</th>
              <th className="py-3 px-4">Taxa de Acerto</th>
              <th className="py-3 px-4">Total Cartões</th>
              <th className="py-3 px-4">Devidos Hoje</th>
              <th className="py-3 px-4 text-right">Média Lapsos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {filtered.map((item, idx) => {
              const isWarning =
                (item.questionsTotal >= 5 && item.accuracyRate < 60) || item.averageLapses >= 2;

              return (
                <tr
                  key={`${item.disciplina}-${item.assunto}-${idx}`}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.assunto}
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                        {item.disciplina}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold">
                    {item.questionsTotal > 0
                      ? `${item.questionsCorrect} / ${item.questionsTotal}`
                      : '—'}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold">
                    {item.questionsTotal > 0 ? (
                      <Badge
                        variant={
                          item.accuracyRate >= 75
                            ? 'success'
                            : item.accuracyRate >= 60
                            ? 'warning'
                            : 'danger'
                        }
                        className="text-xs"
                      >
                        {item.accuracyRate}%
                      </Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold">
                    {item.cardsTotal}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {item.cardsDue > 0 ? (
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {item.cardsDue} pendente(s)
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono">
                    <span
                      className={
                        item.averageLapses >= 2
                          ? 'text-red-600 font-bold'
                          : 'text-slate-500'
                      }
                    >
                      {item.averageLapses}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
