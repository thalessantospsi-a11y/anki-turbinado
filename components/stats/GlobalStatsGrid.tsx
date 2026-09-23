'use client';

import React from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, CheckCircle2, ShieldCheck, Clock, Brain, Award } from 'lucide-react';

interface GlobalStatsGridProps {
  stats: {
    totalCards: number;
    newCards: number;
    learningCards: number;
    youngCards: number;
    matureCards: number;
    averageDifficulty: number;
    averageStability: number;
    totalLapses: number;
    totalReviews: number;
    retentionRate: number;
    averageTimePerCard: number;
    totalQuestions: number;
    correctQuestions: number;
    questionAccuracy: number;
  };
}

export function GlobalStatsGrid({ stats }: GlobalStatsGridProps) {
  const maturePercentage =
    stats.totalCards > 0 ? Math.round((stats.matureCards / stats.totalCards) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 4 Indicadores Executivos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Retenção Global FSRS"
          value={`${stats.retentionRate}%`}
          subtitle="Respostas 'Good' e 'Easy'"
          icon={<RotateCcw className="w-5 h-5 text-blue-500" />}
          highlightColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Acurácia em Questões"
          value={`${stats.questionAccuracy}%`}
          subtitle={`${stats.correctQuestions}/${stats.totalQuestions} acertos`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          highlightColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Cartões Maduros (Longo Prazo)"
          value={stats.matureCards}
          subtitle={`${maturePercentage}% da sua base de memória`}
          icon={<ShieldCheck className="w-5 h-5 text-indigo-500" />}
          highlightColor="text-indigo-600 dark:text-indigo-400"
        />

        <StatCard
          title="Tempo Médio / Cartão"
          value={`${stats.averageTimePerCard}s`}
          subtitle={`${stats.totalReviews} revisões totais`}
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          highlightColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Distribuição da Maturidade dos Flashcards (Seção 30) */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-purple-600" />
            Maturidade da Memória na Plataforma ({stats.totalCards} Cartões)
          </span>
          <span className="text-xs text-slate-400">
            Dificuldade média: {stats.averageDifficulty}/10 • Estabilidade média: {stats.averageStability}d
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
            <span className="block text-lg font-black text-blue-600 dark:text-blue-400">{stats.newCards}</span>
            <span className="text-[11px] text-slate-500">Novos (A iniciar)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
            <span className="block text-lg font-black text-amber-600 dark:text-amber-400">{stats.learningCards}</span>
            <span className="text-[11px] text-slate-500">Em Aprendizado</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
            <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400">{stats.youngCards}</span>
            <span className="text-[11px] text-slate-500">Jovens (&lt; 21d)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50">
            <span className="block text-lg font-black text-purple-600 dark:text-purple-400">{stats.matureCards}</span>
            <span className="text-[11px] text-slate-500">Maduros (&ge; 21d)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
