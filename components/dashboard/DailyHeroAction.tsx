'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DashboardMetrics } from '@/hooks/useDashboardData';
import { Play, RotateCcw, HelpCircle, AlertTriangle, PlusCircle } from 'lucide-react';

interface DailyHeroActionProps {
  metrics: DashboardMetrics;
}

export function DailyHeroAction({ metrics }: DailyHeroActionProps) {
  const { profile } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'BOM DIA';
    if (hour < 18) return 'BOA TARDE';
    return 'BOA NOITE';
  };

  const firstName = profile?.displayName?.split(' ')[0] || 'Estudante';
  const hasPendingItems = metrics.dueCardsCount > 0 || metrics.weakTopics.length > 0;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-none shadow-xl shadow-blue-500/10 p-6 sm:p-8">
      {/* Elemento Decorativo de Fundo */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold tracking-wider uppercase text-blue-200">
            ⚡ {getGreeting()}, {firstName}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            {hasPendingItems ? (
              <>Sua sessão prioritária de hoje está pronta.</>
            ) : (
              <>Tudo em dia com suas revisões!</>
            )}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-blue-100/90 font-medium">
            <span className="flex items-center gap-1.5 bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-400/20">
              <span className="font-bold text-white">{metrics.dueCardsCount}</span> revisões pendentes
            </span>
            <span className="flex items-center gap-1.5 bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-400/20">
              <span className="font-bold text-white">{metrics.newCardsCount}</span> novos cartões
            </span>
            {metrics.weakTopics.length > 0 && (
              <span className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-300/30 text-amber-200">
                <span className="font-bold text-white">{metrics.weakTopics.length}</span> assunto(s) prioritário(s)
              </span>
            )}
          </div>
        </div>

        {/* Ação Primária em Destaque */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
          <Link href="/revisao" className="w-full">
            <Button
              size="lg"
              className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg shadow-black/10 transition-all transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current mr-2" />
              COMEÇAR ESTUDO
            </Button>
          </Link>
        </div>
      </div>

      {/* Ações Rápidas Secundárias */}
      <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Link
          href="/revisao"
          className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs font-semibold text-white backdrop-blur-sm"
        >
          <RotateCcw className="w-4 h-4 text-blue-200" />
          <span>Revisar Agora</span>
        </Link>
        <Link
          href="/questoes"
          className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs font-semibold text-white backdrop-blur-sm"
        >
          <HelpCircle className="w-4 h-4 text-blue-200" />
          <span>Resolver Questões</span>
        </Link>
        <Link
          href="/caderno-erros"
          className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs font-semibold text-white backdrop-blur-sm"
        >
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>Caderno de Erros</span>
        </Link>
        <Link
          href="/baralhos?novo=true"
          className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs font-semibold text-white backdrop-blur-sm"
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>Criar Baralho</span>
        </Link>
      </div>
    </Card>
  );
}
