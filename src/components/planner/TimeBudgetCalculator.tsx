'use client';

import React from 'react';
import Link from 'next/link';
import { DailyTimeDistribution, DailyStudyGoal } from '@/types/planner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  RotateCcw,
  HelpCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Target,
} from 'lucide-react';

interface TimeBudgetCalculatorProps {
  availableHours: number;
  onHoursChange: (hours: number) => void;
  distribution: DailyTimeDistribution;
  goal: DailyStudyGoal;
}

export function TimeBudgetCalculator({
  availableHours,
  onHoursChange,
  distribution,
  goal,
}: TimeBudgetCalculatorProps) {
  const PRESETS = [
    { label: '30 min', hours: 0.5 },
    { label: '1 hora', hours: 1 },
    { label: '1h 30m', hours: 1.5 },
    { label: '2 horas', hours: 2 },
    { label: '3 horas', hours: 3 },
    { label: '4 horas', hours: 4 },
  ];

  const completionPct = Math.min(
    100,
    Math.round((goal.completedMinutes / Math.max(1, goal.targetMinutes)) * 100)
  );

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Modo &quot;Hoje quero estudar X horas&quot;
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Defina sua disponibilidade de hoje. O algoritmo equilibra retenção máxima e resolução prática de questões.
          </p>
        </div>

        {/* Progresso de Hoje */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <Target className="w-4 h-4 text-emerald-500" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">Meta Hoje:</span>
          <span className="font-bold font-mono text-slate-900 dark:text-white">
            {goal.completedMinutes} / {goal.targetMinutes} min ({completionPct}%)
          </span>
        </div>
      </div>

      {/* Seletor de Tempo (Presets Rápidos + Slider) */}
      <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.hours}
              type="button"
              onClick={() => onHoursChange(p.hours)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                availableHours === p.hours
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Barra de Progresso Visual da Meta Diária */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-500">
            <span>Progresso da meta diária ({goal.completedMinutes} min concluídos)</span>
            <span className="font-mono text-emerald-600 font-bold">{completionPct}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Blocos de Distribuição Inteligente do Tempo (Seção 20) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bloco 1: Revisão FSRS */}
        <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" />
                Revisão Pendente (FSRS)
              </span>
              <Badge variant="blue" className="text-[10px]">
                {distribution.reviewMinutes} min
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Meta estimada de <strong className="text-blue-600 font-bold">{distribution.reviewCardsTarget} cards</strong> para zerar a fila de hoje e consolidar a memória.
            </p>
          </div>

          <div className="pt-2">
            <div className="text-[11px] text-slate-500 mb-2 flex justify-between font-mono">
              <span>Feito hoje:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {goal.completedReviews} / {distribution.reviewCardsTarget}
              </span>
            </div>
            <Link href="/revisao">
              <Button size="sm" variant="primary" className="w-full text-xs font-bold gap-1">
                Iniciar Revisões
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Bloco 2: Questões de Concurso */}
        <div className="p-4 rounded-xl border border-purple-200/80 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                Questões de Concurso
              </span>
              <Badge variant="purple" className="text-[10px]">
                {distribution.questionsMinutes} min
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Resolução de <strong className="text-purple-600 font-bold">{distribution.questionsTarget} questões</strong> práticas com análise de alternativas e bancas.
            </p>
          </div>

          <div className="pt-2">
            <div className="text-[11px] text-slate-500 mb-2 flex justify-between font-mono">
              <span>Feito hoje:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {goal.completedQuestions} / {distribution.questionsTarget}
              </span>
            </div>
            <Link href="/questoes">
              <Button size="sm" variant="secondary" className="w-full text-xs font-bold gap-1 text-purple-700 dark:text-purple-300">
                Treinar Questões
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Bloco 3: Novas Cartas */}
        <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Novas Cartas
              </span>
              <Badge variant="default" className="text-[10px]">
                {distribution.newCardsMinutes} min
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Limite saudável de <strong className="text-emerald-600 font-bold">{distribution.newCardsTarget} novos cards</strong> para não inflar a carga de revisões de amanhã.
            </p>
          </div>

          <div className="pt-2">
            <div className="text-[11px] text-slate-500 mb-2 flex justify-between font-mono">
              <span>Expansão de hoje:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {distribution.newCardsTarget} cards
              </span>
            </div>
            <Link href="/baralhos">
              <Button size="sm" variant="outline" className="w-full text-xs font-bold gap-1">
                Ver Baralhos
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
