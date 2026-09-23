'use client';

import React from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { DashboardMetrics } from '@/hooks/useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { RotateCcw, CheckCircle2, Clock, Flame } from 'lucide-react';

interface TodayMetricsGridProps {
  metrics: DashboardMetrics;
}

export function TodayMetricsGrid({ metrics }: TodayMetricsGridProps) {
  const { profile } = useAuth();
  const dailyTargetMinutes = profile?.goals?.dailyStudyMinutes || 60;
  const minutesLeft = Math.max(0, dailyTargetMinutes - metrics.minutesStudiedToday);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Revisões Hoje */}
      <StatCard
        title="Revisões Feitas"
        value={metrics.reviewsCompletedToday}
        subtitle={`${metrics.dueCardsCount} restantes`}
        icon={<RotateCcw className="w-5 h-5 text-blue-500" />}
        highlightColor="text-blue-600 dark:text-blue-400"
      />

      {/* 2. Questões & Acurácia */}
      <StatCard
        title="Questões Hoje"
        value={metrics.questionsAnsweredToday}
        subtitle={
          metrics.questionsAnsweredToday > 0
            ? `${metrics.accuracyRateToday}% de acertos`
            : 'Nenhuma respondida'
        }
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        highlightColor="text-emerald-600 dark:text-emerald-400"
      />

      {/* 3. Tempo Estudado */}
      <StatCard
        title="Tempo de Estudo"
        value={`${metrics.minutesStudiedToday}m`}
        subtitle={
          minutesLeft === 0
            ? 'Meta do dia atingida!'
            : `Faltam ${minutesLeft}m para a meta`
        }
        icon={<Clock className="w-5 h-5 text-indigo-500" />}
        highlightColor="text-indigo-600 dark:text-indigo-400"
      />

      {/* 4. Sequência (Streak) */}
      <StatCard
        title="Sequência de Dias"
        value={`${metrics.streakDays} dias`}
        subtitle="Constância é a chave"
        icon={<Flame className="w-5 h-5 text-amber-500" />}
        highlightColor="text-amber-600 dark:text-amber-400"
      />
    </div>
  );
}
