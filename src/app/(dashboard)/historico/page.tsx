'use client';

import React from 'react';
import { useReviewHistory } from '@/hooks/useReviewHistory';
import { HistoryStatsOverview } from '@/components/history/HistoryStatsOverview';
import { HistoryFilterBar } from '@/components/history/HistoryFilterBar';
import { ReviewLogTable } from '@/components/history/ReviewLogTable';
import { LoadingState } from '@/components/ui/loading-state';
import { History } from 'lucide-react';

export default function HistoryPage() {
  const {
    logs,
    loading,
    stats,
    period,
    setPeriod,
    ratingFilter,
    setRatingFilter,
    search,
    setSearch,
  } = useReviewHistory();

  if (loading) {
    return <LoadingState message="Carregando logs de auditoria do FSRS..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <History className="w-6 h-6 text-blue-600" />
          Histórico de Estudos & Logs FSRS
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Auditoria transparente de todas as revisões, intervalos calculados e tempos de resposta.
        </p>
      </div>

      {/* Cartões de Estatísticas do Período */}
      <HistoryStatsOverview stats={stats} />

      {/* Barra de Busca e Filtros */}
      <HistoryFilterBar
        search={search}
        onSearchChange={setSearch}
        period={period}
        onPeriodChange={setPeriod}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
      />

      {/* Tabela de Logs */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-500 px-1">
          <span>Exibindo {logs.length} revisões filtradas</span>
        </div>
        <ReviewLogTable logs={logs} />
      </div>
    </div>
  );
}
