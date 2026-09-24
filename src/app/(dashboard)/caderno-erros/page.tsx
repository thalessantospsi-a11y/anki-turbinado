'use client';

import React from 'react';
import Link from 'next/link';
import { useErrorNotebook } from '@/hooks/useErrorNotebook';
import { ErrorDistributionChart } from '@/components/errors/ErrorDistributionChart';
import { ErrorFilterBar } from '@/components/errors/ErrorFilterBar';
import { ErrorItemCard } from '@/components/errors/ErrorItemCard';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { AlertTriangle, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

export default function ErrorNotebookPage() {
  const {
    entries,
    loading,
    diagnostics,
    disciplinas,
    reasonFilter,
    setReasonFilter,
    onlyPendingCards,
    setOnlyPendingCards,
    selectedDisciplina,
    setSelectedDisciplina,
    search,
    setSearch,
    updateErrorReason,
  } = useErrorNotebook();

  if (loading) {
    return <LoadingState message="Carregando seu Caderno de Erros..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Caderno de Erros & Loop de Reforço
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transforme cada erro em um ativo de memorização ativa no algoritmo FSRS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/questoes">
            <Button variant="outline" className="text-xs font-semibold">
              Treinar Mais Questões
            </Button>
          </Link>
        </div>
      </div>

      {/* Banner Explicativo do Loop Inteligente (Seção 14) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/40 border border-blue-500/20 text-xs text-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <span className="font-extrabold uppercase tracking-wider text-blue-300 block text-[11px]">
            ⚡ O Loop Inteligente de Erros
          </span>
          <p className="text-slate-300 leading-relaxed max-w-2xl">
            Questão Errada <span className="text-blue-400">→</span> Diagnóstico do Motivo{' '}
            <span className="text-blue-400">→</span> Flashcard FSRS{' '}
            <span className="text-blue-400">→</span> Repetição Espaçada{' '}
            <span className="text-blue-400">→</span> Eliminação do Ponto Fraco.
          </p>
        </div>
      </div>

      {/* Diagnóstico Geral dos Motivos de Erro */}
      <ErrorDistributionChart diagnostics={diagnostics} />

      {/* Barra de Filtros */}
      <ErrorFilterBar
        search={search}
        onSearchChange={setSearch}
        reasonFilter={reasonFilter}
        onReasonFilterChange={setReasonFilter}
        onlyPendingCards={onlyPendingCards}
        onTogglePendingCards={setOnlyPendingCards}
        selectedDisciplina={selectedDisciplina}
        onDisciplinaChange={setSelectedDisciplina}
        disciplinas={disciplinas}
      />

      {/* Listagem dos Itens do Caderno de Erros */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-500 px-1 font-semibold">
          <span>{entries.length} questão(ões) com erro registradas</span>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="Nenhum erro registrado neste filtro"
            description="Parabéns! Você não possui erros pendentes com estes critérios. Continue respondendo questões para testar seus limites."
            action={
              <Link href="/questoes">
                <Button variant="primary">
                  Resolver Questões Agora
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <ErrorItemCard
                key={entry.attempt.id}
                entry={entry}
                onUpdateReason={updateErrorReason}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
