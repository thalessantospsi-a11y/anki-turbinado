'use client';

import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DailyHeroAction } from '@/components/dashboard/DailyHeroAction';
import { TodayMetricsGrid } from '@/components/dashboard/TodayMetricsGrid';
import { WeakTopicsList } from '@/components/dashboard/WeakTopicsList';
import { FutureLoadChart } from '@/components/dashboard/FutureLoadChart';
import { RecentErrorsSummary } from '@/components/dashboard/RecentErrorsSummary';
import { LoadingState } from '@/components/ui/loading-state';

export default function DashboardPage() {
  const { metrics, loading } = useDashboardData();

  if (loading) {
    return <LoadingState message="Sincronizando suas revisões FSRS e estatísticas..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. Hero Principal: "O que eu devo estudar agora?" */}
      <DailyHeroAction metrics={metrics} />

      {/* 2. Grade de Métricas Diárias */}
      <TodayMetricsGrid metrics={metrics} />

      {/* 3. Grid de Análise e Recomendações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda: Assuntos que merecem atenção + Erros recentes */}
        <div className="space-y-6">
          <WeakTopicsList topics={metrics.weakTopics} />
          <RecentErrorsSummary attempts={metrics.recentErrors} />
        </div>

        {/* Coluna Direita: Previsão de Carga FSRS */}
        <div className="space-y-6">
          <FutureLoadChart projections={metrics.futureLoad} />
        </div>
      </div>
    </div>
  );
}
