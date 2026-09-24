'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Flame, ShieldCheck, Calendar, Trophy } from 'lucide-react';

interface StreakHistoryCardProps {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate?: string;
}

export function StreakHistoryCard({
  currentStreak,
  bestStreak,
  lastActiveDate,
}: StreakHistoryCardProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const isProtectedToday = lastActiveDate === todayStr;

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600">
            <Flame className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Ofensiva e Constância
            </h3>
            <p className="text-xs text-slate-500">
              Mantenha o hábito diário de revisões ativas para proteger sua taxa de retenção.
            </p>
          </div>
        </div>

        {isProtectedToday ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            Ofensiva Ativa Hoje
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-700 dark:text-amber-300">
            Pendente Hoje
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Ofensiva Atual */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-200 dark:border-orange-900/40 text-center space-y-1">
          <span className="text-xs text-orange-700 dark:text-orange-400 font-semibold block uppercase tracking-wider">
            Ofensiva Atual
          </span>
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-6 h-6 text-orange-500 fill-current" />
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {currentStreak}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              {currentStreak === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        </div>

        {/* Recorde */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">
            Melhor Sequência
          </span>
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {bestStreak}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              {bestStreak === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
