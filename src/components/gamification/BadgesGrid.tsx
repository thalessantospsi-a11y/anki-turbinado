'use client';

import React, { useState } from 'react';
import { Badge as BadgeType, BadgeCategory } from '@/types/gamification';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge as UiBadge } from '@/components/ui/badge';
import { Award, CheckCircle2, Lock, Sparkles } from 'lucide-react';

interface BadgesGridProps {
  badges: BadgeType[];
  unlockedCount: number;
}

export function BadgesGrid({ badges, unlockedCount }: BadgesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const CATEGORIES = [
    { id: 'all', label: 'Todas' },
    { id: 'streak', label: 'Ofensiva' },
    { id: 'cards', label: 'Flashcards' },
    { id: 'questions', label: 'Questões' },
    { id: 'exam', label: 'Simulados' },
    { id: 'mastery', label: 'Estrategista' },
  ];

  const filteredBadges = badges.filter((b) => {
    if (selectedCategory === 'all') return true;
    return b.category === selectedCategory;
  });

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Topo: Título e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Galeria de Conquistas & Medalhas
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {unlockedCount} de {badges.length} insígnias desbloqueadas em sua jornada.
          </p>
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grade de Conquistas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.unlocked;
          const progressPct = Math.round(
            (badge.progress.current / Math.max(1, badge.progress.max)) * 100
          );

          return (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isUnlocked
                  ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white dark:to-slate-900 border-amber-300 dark:border-amber-800/60 shadow-sm'
                  : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
              }`}
            >
              {/* Header do Card */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${
                    isUnlocked
                      ? 'bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-700'
                      : 'bg-slate-200 dark:bg-slate-700 grayscale'
                  }`}
                >
                  {badge.icon}
                </div>

                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`font-bold text-xs truncate ${
                        isUnlocked
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {badge.title}
                    </h4>

                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Barra de Progresso da Insígnia */}
              <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>{isUnlocked ? 'Conquistada!' : 'Em progresso'}</span>
                  <span className="font-mono">
                    {badge.progress.current} / {badge.progress.max}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
