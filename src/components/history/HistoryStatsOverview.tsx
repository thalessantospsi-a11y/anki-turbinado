'use client';

import React from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { RotateCcw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface HistoryStatsOverviewProps {
  stats: {
    totalReviews: number;
    averageDurationSeconds: number;
    retentionRate: number;
    againCount: number;
    hardCount: number;
    goodCount: number;
    easyCount: number;
  };
}

export function HistoryStatsOverview({ stats }: HistoryStatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        title="Revisões no Período"
        value={stats.totalReviews}
        subtitle={`${stats.goodCount + stats.easyCount} com retenção positiva`}
        icon={<RotateCcw className="w-5 h-5 text-blue-500" />}
        highlightColor="text-blue-600 dark:text-blue-400"
      />

      <StatCard
        title="Taxa de Retenção FSRS"
        value={`${stats.retentionRate}%`}
        subtitle="Meta ideal: ≥ 90%"
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        highlightColor={
          stats.retentionRate >= 90
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-amber-600 dark:text-amber-400'
        }
      />

      <StatCard
        title="Tempo Médio / Cartão"
        value={`${stats.averageDurationSeconds}s`}
        subtitle="Velocidade de recuperação ativa"
        icon={<Clock className="w-5 h-5 text-indigo-500" />}
        highlightColor="text-indigo-600 dark:text-indigo-400"
      />

      <StatCard
        title="Lapsos Registrados"
        value={stats.againCount}
        subtitle={`${stats.hardCount} avaliados como Difíceis`}
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        highlightColor="text-red-600 dark:text-red-400"
      />
    </div>
  );
}
