'use client';

import React, { useState } from 'react';
import { useDetailedStats } from '@/hooks/useDetailedStats';
import { GlobalStatsGrid } from '@/components/stats/GlobalStatsGrid';
import { StatsBySubjectTable } from '@/components/stats/StatsBySubjectTable';
import { StatsByBancaCard } from '@/components/stats/StatsByBancaCard';
import { Tabs } from '@/components/ui/tabs';
import { LoadingState } from '@/components/ui/loading-state';
import { BarChart3, Layers, Building2, TrendingUp } from 'lucide-react';

export default function StatisticsPage() {
  const { globalStats, subjectStats, bancaStats, loading } = useDetailedStats();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Visão Geral & FSRS', icon: <TrendingUp className="w-4 h-4" /> },
    {
      id: 'subjects',
      label: 'Por Assunto',
      icon: <Layers className="w-4 h-4" />,
      count: subjectStats.length,
    },
    {
      id: 'bancas',
      label: 'Por Banca Examinadora',
      icon: <Building2 className="w-4 h-4" />,
      count: bancaStats.length,
    },
  ];

  if (loading) {
    return <LoadingState message="Compilando métricas analíticas e estatísticas FSRS..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Estatísticas & Análise de Desempenho
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Acompanhamento métrico da consolidação de memória, acurácia em questões e evolução por banca.
        </p>
      </div>

      {/* Navegação por Abas */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Conteúdo da Aba Ativa */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <GlobalStatsGrid stats={globalStats} />
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <StatsBySubjectTable subjects={subjectStats} />
        </div>
      )}

      {activeTab === 'bancas' && (
        <div className="space-y-4">
          <StatsByBancaCard bancas={bancaStats} />
        </div>
      )}
    </div>
  );
}
