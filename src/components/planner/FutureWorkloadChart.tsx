'use client';

import React from 'react';
import { WorkloadForecastReport } from '@/types/planner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, Lightbulb, Calendar, Flame } from 'lucide-react';

interface FutureWorkloadChartProps {
  report: WorkloadForecastReport;
  horizon: 7 | 14 | 30;
  onHorizonChange: (h: 7 | 14 | 30) => void;
}

export function FutureWorkloadChart({
  report,
  horizon,
  onHorizonChange,
}: FutureWorkloadChartProps) {
  const maxDue = Math.max(1, ...(report.days.map((d) => d.dueCount) || [1]));

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Topo: Título e Seletor de Horizonte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Previsão de Carga Futura FSRS
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Volume de revisões agendadas pelos intervalos do algoritmo FSRS para os próximos dias.
          </p>
        </div>

        {/* Botões de Horizonte: 7, 14, 30 dias */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          {([7, 14, 30] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onHorizonChange(h)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                horizon === h
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {h} dias
            </button>
          ))}
        </div>
      </div>

      {/* Alertas de Sobrecarga (Seção 19: "Atenção: em 3 dias você terá 120 revisões acumuladas") */}
      {report.overloadWarnings.length > 0 && (
        <div className="space-y-2">
          {report.overloadWarnings.slice(0, 2).map((warning, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">
                {warning}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gráfico de Barras Responsivo */}
      <div className="pt-2">
        <div className="flex items-end justify-between gap-1.5 h-44 sm:h-52 px-1 pb-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {report.days.map((day, idx) => {
            const heightPercent = Math.max(6, Math.round((day.dueCount / maxDue) * 100));
            const isToday = idx === 0;

            let barColor = 'bg-blue-500 hover:bg-blue-600';
            if (day.isOverloaded) {
              barColor = 'bg-red-500 hover:bg-red-600';
            } else if (isToday) {
              barColor = 'bg-emerald-500 hover:bg-emerald-600';
            }

            return (
              <div
                key={day.date}
                className="flex-1 min-w-[20px] max-w-[45px] flex flex-col items-center justify-end h-full group relative"
              >
                {/* Tooltip no Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 z-20 pointer-events-none bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md shadow-lg whitespace-nowrap">
                  <span className="font-bold">{day.dueCount} cards</span> • {day.dayLabel}
                </div>

                {/* Valor no topo se houver espaço */}
                <span className="text-[10px] font-mono font-semibold text-slate-500 mb-1 group-hover:text-blue-600 transition-colors">
                  {day.dueCount > 0 ? day.dueCount : ''}
                </span>

                {/* Barra */}
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${barColor}`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Labels de Dias Abaixo das Barras */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-2 px-1">
          <span>Hoje ({report.days[0]?.dayLabel})</span>
          {horizon >= 14 && (
            <span>Dia {Math.round(horizon / 2)}</span>
          )}
          <span>+ {horizon} dias</span>
        </div>
      </div>

      {/* Rodapé Inteligente: Sugestão de Distribuição (Seção 19) */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Sugestão de Expansão Saudável
            </span>
            <span className="text-slate-500">
              Para não estourar a meta diária e evitar gargalos nos próximos 14 dias, estude no máximo{' '}
              <strong className="text-blue-600 font-bold">{report.recommendedMaxNewPerDay} novas cartas por dia</strong>.
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Previsto</span>
          <span className="text-base font-black font-mono text-slate-900 dark:text-white">
            {report.totalForecasted} revisões
          </span>
        </div>
      </div>
    </Card>
  );
}
