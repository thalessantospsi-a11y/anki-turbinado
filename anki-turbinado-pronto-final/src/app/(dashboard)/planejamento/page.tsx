'use client';

import React from 'react';
import { useStudyPlanner } from '@/hooks/useStudyPlanner';
import { TimeBudgetCalculator } from '@/components/planner/TimeBudgetCalculator';
import { FutureWorkloadChart } from '@/components/planner/FutureWorkloadChart';
import { StudyHeatmap } from '@/components/planner/StudyHeatmap';
import { LoadingState } from '@/components/ui/loading-state';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Layers, RotateCcw, Sparkles } from 'lucide-react';

export default function StudyPlanningPage() {
  const {
    loading,
    cardsCount,
    dueTodayCount,
    newCardsCount,
    availableHours,
    setAvailableHours,
    forecastHorizon,
    setForecastHorizon,
    timeDistribution,
    workloadForecast,
    heatmapData,
    studyGoal,
  } = useStudyPlanner();

  if (loading) {
    return <LoadingState message="Calculando intervalos FSRS e projeção de carga..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            Planejamento, Metas & Previsão de Carga
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Controle a carga cognitiva dos seus baralhos, evite o efeito bola de neve e planeje suas horas diárias.
          </p>
        </div>

        {/* Resumo Rápido de Cards */}
        <div className="flex items-center gap-2">
          <Badge variant="blue" className="text-xs py-1 px-2.5 gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            {dueTodayCount} pendentes hoje
          </Badge>
          <Badge variant="secondary" className="text-xs py-1 px-2.5 gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {newCardsCount} novas
          </Badge>
          <Badge variant="default" className="text-xs py-1 px-2.5 gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            {cardsCount} total
          </Badge>
        </div>
      </div>

      {/* 1. Modo "Hoje quero estudar X horas" (Seção 20) */}
      <TimeBudgetCalculator
        availableHours={availableHours}
        onHoursChange={setAvailableHours}
        distribution={timeDistribution}
        goal={studyGoal}
      />

      {/* 2. Gráfico de Previsão de Carga Futura (Seção 19) */}
      <FutureWorkloadChart
        report={workloadForecast}
        horizon={forecastHorizon}
        onHorizonChange={setForecastHorizon}
      />

      {/* 3. Heatmap de Frequência e Ofensiva (Seção 20) */}
      <StudyHeatmap days={heatmapData} />
    </div>
  );
}
