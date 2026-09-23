'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Brain, Zap, Target, ShieldAlert } from 'lucide-react';

interface ErrorDistributionChartProps {
  diagnostics: {
    totalErrors: number;
    coverageRate: number;
    topCategory: string;
    categories?: {
      conceptual: number;
      attention: number;
      pitfall: number;
    };
  };
}

export function ErrorDistributionChart({ diagnostics }: ErrorDistributionChartProps) {
  const total = diagnostics.totalErrors || 1;
  const conceptualPct = diagnostics.categories
    ? Math.round((diagnostics.categories.conceptual / total) * 100)
    : 0;
  const attentionPct = diagnostics.categories
    ? Math.round((diagnostics.categories.attention / total) * 100)
    : 0;
  const pitfallPct = diagnostics.categories
    ? Math.round((diagnostics.categories.pitfall / total) * 100)
    : 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Diagnóstico dos Motivos de Erro</CardTitle>
              <CardDescription>
                Análise pedagógica para diferenciar falha de memória de armadilhas da banca.
              </CardDescription>
            </div>
          </div>
          <Badge variant="default" className="text-xs">
            Principal Causa: {diagnostics.topCategory}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barras de Diagnóstico de Erros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Conceitual */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
              <span className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-blue-600" />
                Conceitual / Memória
              </span>
              <span>{conceptualPct}%</span>
            </div>
            <Progress value={conceptualPct} indicatorColor="bg-blue-600" size="sm" />
            <span className="text-[10px] text-slate-500 block">
              Esquecimento ou confusão de conceitos. Solução: Flashcards FSRS.
            </span>
          </div>

          {/* 2. Atenção e Interpretação */}
          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                Atenção / Leitura
              </span>
              <span>{attentionPct}%</span>
            </div>
            <Progress value={attentionPct} indicatorColor="bg-amber-500" size="sm" />
            <span className="text-[10px] text-slate-500 block">
              Leitura apressada ou distração. Solução: Grifar palavras restritivas.
            </span>
          </div>

          {/* 3. Pegadinha de Banca */}
          <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                Pegadinha de Banca
              </span>
              <span>{pitfallPct}%</span>
            </div>
            <Progress value={pitfallPct} indicatorColor="bg-purple-600" size="sm" />
            <span className="text-[10px] text-slate-500 block">
              Inversão de termos pelo examinador. Solução: Cartões de contraste.
            </span>
          </div>
        </div>

        {/* Indicador de Cobertura do Loop de Reforço FSRS */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-500" />
              Taxa de Cobertura do Loop de Reforço: {diagnostics.coverageRate}%
            </span>
            <span className="text-slate-500 text-[11px] block">
              Percentual de erros que já foram convertidos em flashcards no seu ciclo de revisão FSRS.
            </span>
          </div>
          <div className="w-full sm:w-48">
            <Progress value={diagnostics.coverageRate} indicatorColor="bg-emerald-600" size="md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
