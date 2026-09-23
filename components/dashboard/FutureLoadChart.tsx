'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FutureLoadProjection } from '@/core/analytics/types';
import { Calendar, AlertTriangle, ArrowRight } from 'lucide-react';

interface FutureLoadChartProps {
  projections: FutureLoadProjection[];
}

export function FutureLoadChart({ projections }: FutureLoadChartProps) {
  const maxLoad = Math.max(...projections.map((p) => p.estimatedDueCards), 1);
  const isOverloaded = projections.some((p) => p.estimatedDueCards > 150);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Previsão de Carga FSRS</CardTitle>
              <CardDescription>
                Estimativa cumulativa de cartões a vencer nos próximos dias.
              </CardDescription>
            </div>
          </div>
          <Link
            href="/planejamento"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Metas
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isOverloaded && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>
              Adicionar mais de 20 novos cartões por dia poderá inflacionar sua carga em 14 e 30 dias.
            </span>
          </div>
        )}

        <div className="space-y-3">
          {projections.map((proj) => {
            const percentage = Math.min(100, Math.round((proj.estimatedDueCards / maxLoad) * 100));

            return (
              <div key={proj.dateString} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{proj.dateString}</span>
                  <span>{proj.estimatedDueCards} cartões</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
