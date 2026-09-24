'use client';

import React from 'react';
import { LevelInfo } from '@/types/gamification';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trophy, Award, Zap } from 'lucide-react';

interface LevelCardProps {
  totalXp: number;
  levelInfo: LevelInfo;
}

export function LevelCard({ totalXp, levelInfo }: LevelCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 border-slate-200 dark:border-slate-800 shadow-md space-y-6">
      {/* Topo do Nível */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 font-black text-2xl font-mono">
              {levelInfo.level}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-1 shadow-sm">
              <Trophy className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600 dark:text-blue-400">
                Nível de Concurseiro
              </span>
              <Badge variant="purple" className="text-[10px]">
                Nível {levelInfo.level}
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {levelInfo.title}
            </h2>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-slate-400 font-semibold block">Total de Experiência</span>
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-center sm:justify-end gap-1.5">
            <Zap className="w-5 h-5 text-amber-500 fill-current" />
            {totalXp.toLocaleString('pt-BR')} XP
          </span>
        </div>
      </div>

      {/* Barra de Progresso para o Próximo Nível */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>Progresso para o Nível {levelInfo.level + 1}</span>
          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
            {levelInfo.currentLevelXp} / {levelInfo.levelTotalXp} XP ({levelInfo.progressPercentage}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${levelInfo.progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-0.5">
          <span>{levelInfo.minXp} XP</span>
          <span>Faltam {levelInfo.levelTotalXp - levelInfo.currentLevelXp} XP para upar</span>
          <span>{levelInfo.maxXp} XP</span>
        </div>
      </div>

      {/* Regras Claras de Pontuação (Seção 21) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
          <span className="font-bold text-blue-600 font-mono block text-sm">+10 XP</span>
          <span className="text-[11px] text-slate-500">Por card revisado</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
          <span className="font-bold text-emerald-600 font-mono block text-sm">+25 XP</span>
          <span className="text-[11px] text-slate-500">Por questão correta</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
          <span className="font-bold text-amber-600 font-mono block text-sm">+100 XP</span>
          <span className="text-[11px] text-slate-500">Meta diária batida</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
          <span className="font-bold text-purple-600 font-mono block text-sm">+50 XP</span>
          <span className="text-[11px] text-slate-500">Streak mantido</span>
        </div>
      </div>
    </Card>
  );
}
