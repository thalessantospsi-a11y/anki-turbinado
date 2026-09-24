'use client';

import React from 'react';
import { useGamification } from '@/hooks/useGamification';
import { LevelCard } from '@/components/gamification/LevelCard';
import { StreakHistoryCard } from '@/components/gamification/StreakHistoryCard';
import { BadgesGrid } from '@/components/gamification/BadgesGrid';
import { LoadingState } from '@/components/ui/loading-state';
import { Trophy, Sparkles } from 'lucide-react';

export default function GamificationPage() {
  const {
    loading,
    totalXp,
    levelInfo,
    streak,
    badges,
    unlockedBadgesCount,
  } = useGamification();

  if (loading) {
    return <LoadingState message="Carregando sua jornada de experiência e insígnias..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-500" />
            Conquistas & Nível Concurseiro
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ganhe XP a cada card revisado e questão resolvida, suba de patente e desbloqueie medalhas de mérito.
          </p>
        </div>
      </div>

      {/* 1. Nível Concurseiro & Experiência XP */}
      <LevelCard totalXp={totalXp} levelInfo={levelInfo} />

      {/* 2. Histórico de Ofensiva e Frequência */}
      <StreakHistoryCard
        currentStreak={streak.current}
        bestStreak={streak.best}
        lastActiveDate={streak.lastActiveDate}
      />

      {/* 3. Galeria de Insígnias e Desafios */}
      <BadgesGrid
        badges={badges}
        unlockedCount={unlockedBadgesCount}
      />
    </div>
  );
}
