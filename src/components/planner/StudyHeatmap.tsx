'use client';

import React, { useMemo } from 'react';
import { HeatmapDay } from '@/types/planner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Flame, Calendar, Trophy } from 'lucide-react';

interface StudyHeatmapProps {
  days: HeatmapDay[];
}

export function StudyHeatmap({ days }: StudyHeatmapProps) {
  // Calcular métricas de constância
  const { currentStreak, activeDaysCount, totalReviews } = useMemo(() => {
    let streak = 0;
    let active = 0;
    let total = 0;

    // Percorrer de trás para frente (do dia mais recente para o mais antigo)
    const reversed = [...days].reverse();

    for (let i = 0; i < reversed.length; i++) {
      const d = reversed[i];
      if (d.count > 0) {
        streak++;
      } else {
        // Se hoje ainda tem 0, mas ontem teve, streak de ontem continua
        if (i === 0) continue;
        break;
      }
    }

    days.forEach((d) => {
      if (d.count > 0) active++;
      total += d.count;
    });

    return {
      currentStreak: streak,
      activeDaysCount: active,
      totalReviews: total,
    };
  }, [days]);

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      {/* Cabeçalho com Métricas de Constância */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Histórico de Frequência & Dias Ativos
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Mapa de calor com todas as sessões e revisões concluídas nos últimos 90 dias.
          </p>
        </div>

        {/* Badges de Streak e Dias Ativos */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/50 text-xs">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-slate-600 dark:text-slate-300">Ofensiva:</span>
            <span className="font-extrabold font-mono text-orange-600 dark:text-orange-400">
              {currentStreak} {currentStreak === 1 ? 'dia' : 'dias'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600 dark:text-slate-300">Dias Ativos:</span>
            <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {activeDaysCount} / {days.length}
            </span>
          </div>
        </div>
      </div>

      {/* Grade Heatmap (Estilo GitHub) */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 p-1 min-w-[500px]">
          {days.map((day) => {
            let color = 'bg-slate-100 dark:bg-slate-800/80';
            if (day.intensity === 1) color = 'bg-emerald-200 dark:bg-emerald-900/60';
            if (day.intensity === 2) color = 'bg-emerald-400 dark:bg-emerald-700';
            if (day.intensity === 3) color = 'bg-emerald-500 dark:bg-emerald-500';
            if (day.intensity === 4) color = 'bg-emerald-700 dark:bg-emerald-300';

            return (
              <div
                key={day.date}
                className="group relative"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-sm transition-all cursor-pointer ${color} hover:ring-2 hover:ring-emerald-500 hover:scale-110`}
                />
                {/* Tooltip do dia */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md shadow-lg whitespace-nowrap">
                  <span className="font-bold">{day.count} revisões</span> • {day.date}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda de Intensidade */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span>Menos ativo</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/60" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <div className="w-3 h-3 rounded-sm bg-emerald-700" />
        </div>
        <span>Mais ativo</span>
      </div>
    </Card>
  );
}
