'use client';

import React from 'react';
import { EnrichedReviewLog } from '@/hooks/useReviewHistory';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatIntervalLabel } from '@/core/fsrs/scheduler';
import { Clock, Calendar, Layers } from 'lucide-react';

interface ReviewLogTableProps {
  logs: EnrichedReviewLog[];
}

export function ReviewLogTable({ logs }: ReviewLogTableProps) {
  const getRatingBadge = (rating: number) => {
    switch (rating) {
      case 1:
        return <Badge variant="danger">Again (1)</Badge>;
      case 2:
        return <Badge variant="warning">Hard (2)</Badge>;
      case 3:
        return <Badge variant="success">Good (3)</Badge>;
      case 4:
        return <Badge variant="default">Easy (4)</Badge>;
      default:
        return null;
    }
  };

  const getStateLabel = (state: number) => {
    switch (state) {
      case 0:
        return 'Novo';
      case 1:
        return 'Aprendizado';
      case 2:
        return 'Revisão';
      case 3:
        return 'Reaprendizado';
      default:
        return '';
    }
  };

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
        Nenhum registro de revisão encontrado para os filtros selecionados.
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Data / Hora</th>
              <th className="py-3 px-4">Pergunta / Cartão</th>
              <th className="py-3 px-4">Baralho / Assunto</th>
              <th className="py-3 px-4">Classificação</th>
              <th className="py-3 px-4">Novo Intervalo</th>
              <th className="py-3 px-4 text-right">Tempo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {logs.map((log) => {
              const date = new Date(log.reviewTimestamp);
              const formattedDate = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                    {formattedDate}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs sm:max-w-md truncate font-semibold text-slate-900 dark:text-white">
                    {log.cardFront}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.deckTitle}
                      </span>
                      {log.disciplina && (
                        <span className="text-[10px] text-slate-400">
                          {log.disciplina} › {log.assunto}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getRatingBadge(log.rating)}
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {getStateLabel(log.state)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white font-mono">
                    +{formatIntervalLabel(log.scheduledDays)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-slate-500">
                    {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : '-'}
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
