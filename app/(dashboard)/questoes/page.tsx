'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuestionsSession } from '@/hooks/useQuestionsSession';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { QuestionFilterPanel } from '@/components/questions/QuestionFilterPanel';
import { QuestionCreateModal } from '@/components/questions/QuestionCreateModal';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { HelpCircle, Plus, CheckCircle, Award } from 'lucide-react';

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const initialDisciplina = searchParams.get('disciplina') || undefined;
  const initialAssunto = searchParams.get('assunto') || undefined;
  const initialBanca = searchParams.get('banca') || undefined;

  const {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedOptionId,
    setSelectedOptionId,
    isAnswered,
    loading,
    filters,
    setFilters,
    sessionResults,
    answeredCount,
    correctCount,
    submitAnswer,
    toggleFavorite,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    refresh,
  } = useQuestionsSession({
    disciplina: initialDisciplina,
    assunto: initialAssunto,
    banca: initialBanca,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Extrai listas únicas de disciplinas e bancas para o filtro
  const disciplinas = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.metadata.disciplina) set.add(q.metadata.disciplina);
    });
    return Array.from(set).sort();
  }, [questions]);

  const bancas = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.metadata.banca) set.add(q.metadata.banca);
    });
    return Array.from(set).sort();
  }, [questions]);

  const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  if (loading) {
    return <LoadingState message="Carregando banco de questões..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            Banco de Questões
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Treine com questões no estilo prova, consulte gabaritos comentados e alimente o Caderno de Erros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {answeredCount > 0 && (
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {answeredCount}/{totalQuestions} feitas
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {accuracyRate}% acertos
              </span>
            </div>
          )}

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs font-semibold gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nova Questão
          </Button>
        </div>
      </div>

      {/* Painel de Filtros */}
      <QuestionFilterPanel
        filters={filters}
        onChange={setFilters}
        disciplinas={disciplinas}
        bancas={bancas}
      />

      {/* Mapa de Navegação Rápida pelas Questões (Seção 18: Mapa de questões) */}
      {totalQuestions > 0 && (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 mr-2 flex-shrink-0">
            Navegar:
          </span>
          {questions.map((q, idx) => {
            const res = sessionResults.get(q.id);
            const isCurrent = idx === currentIndex;

            let btnStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
            if (res) {
              btnStyle = res.isCorrect
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-red-600 text-white font-bold';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => jumpToQuestion(idx)}
                className={`w-7 h-7 flex-shrink-0 rounded-lg text-xs font-mono transition-all flex items-center justify-center ${btnStyle} ${
                  isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : ''
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Card da Questão Ativa ou Estado Vazio */}
      {currentQuestion ? (
        <QuestionCard
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          selectedOptionId={selectedOptionId}
          onSelectOption={setSelectedOptionId}
          isAnswered={isAnswered}
          onSubmit={submitAnswer}
          onToggleFavorite={toggleFavorite}
          onNext={nextQuestion}
          onPrev={prevQuestion}
        />
      ) : (
        <EmptyState
          icon="📝"
          title="Nenhuma questão encontrada"
          description="Ajuste os filtros de disciplina e banca ou cadastre a primeira questão para começar a praticar."
          action={
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Cadastrar Questão
            </Button>
          }
        />
      )}

      {/* Modal de Criação de Questão */}
      <QuestionCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={refresh}
      />
    </div>
  );
}
