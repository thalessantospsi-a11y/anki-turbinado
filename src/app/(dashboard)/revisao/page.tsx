'use client';

import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useReviewSession } from '@/hooks/useReviewSession';
import { StudyCardView } from '@/components/study/StudyCardView';
import { ReviewButtons } from '@/components/study/ReviewButtons';
import { SessionSummaryModal } from '@/components/study/SessionSummaryModal';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId') || undefined;
  const mode = (searchParams.get('mode') as any) || 'normal';
  const tag = searchParams.get('tag') || undefined;

  const {
    currentCard,
    currentIndex,
    totalCards,
    isAnswerRevealed,
    intervals,
    loading,
    isFinished,
    ratingsCount,
    sessionStartTime,
    revealAnswer,
    rateCurrentCard,
    suspendCurrentCard,
    finalizeSession,
  } = useReviewSession({ deckId, mode, tag });

  // Listener Global de Atalhos de Teclado (Seção 57 do Prompt Mestre)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isAnswerRevealed) {
          revealAnswer();
        }
      } else if (isAnswerRevealed) {
        if (e.key === '1') {
          e.preventDefault();
          rateCurrentCard(1);
        } else if (e.key === '2') {
          e.preventDefault();
          rateCurrentCard(2);
        } else if (e.key === '3') {
          e.preventDefault();
          rateCurrentCard(3);
        } else if (e.key === '4') {
          e.preventDefault();
          rateCurrentCard(4);
        }
      }

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        suspendCurrentCard();
      }
    },
    [isAnswerRevealed, revealAnswer, rateCurrentCard, suspendCurrentCard]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return <LoadingState message="Preparando sua fila de repetição FSRS..." />;
  }

  // Estado: Fim da Sessão
  if (isFinished) {
    const durationMinutes = Math.max(
      1,
      Math.round((Date.now() - sessionStartTime.getTime()) / (1000 * 60))
    );

    return (
      <SessionSummaryModal
        isOpen={true}
        onClose={() => {}}
        durationMinutes={durationMinutes}
        ratingsCount={ratingsCount}
      />
    );
  }

  // Estado: Sem cartões para revisar
  if (!currentCard || totalCards === 0) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <EmptyState
          icon="🎉"
          title="Tudo revisado por aqui!"
          description="Você concluiu todos os cartões programados para hoje. Seus intervalos FSRS foram atualizados com sucesso."
          action={
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">Voltar para o Início</Button>
              </Link>
              <Link href="/baralhos">
                <Button variant="primary">Explorar Baralhos</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const progressPercentage = Math.round(((currentIndex + 1) / totalCards) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Barra Minimalista Superior: Progresso e Contador (Seção 92) */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Link href={deckId ? `/baralhos/${deckId}` : '/'}>
          <Button variant="ghost" size="sm" className="text-xs -ml-2 text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Sair da Sessão
          </Button>
        </Link>

        {/* Contador Centralizado: 24 / 42 */}
        <div className="flex items-center gap-3 flex-1 max-w-xs mx-auto">
          <Progress value={progressPercentage} size="sm" className="flex-1" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap">
            {currentIndex + 1} / {totalCards}
          </span>
        </div>

        {/* Dica de Atalho */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300 font-bold">
            Espaço
          </span>
          <span>virar</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300 font-bold ml-1">
            1-4
          </span>
          <span>avaliar</span>
        </div>
      </div>

      {/* Cartão de Estudo em Foco */}
      <StudyCardView
        card={currentCard}
        isAnswerRevealed={isAnswerRevealed}
        onReveal={revealAnswer}
        onSuspend={suspendCurrentCard}
      />

      {/* Botões de Classificação FSRS (Aparecem após virar o cartão) */}
      {isAnswerRevealed && (
        <div className="pt-2 animate-fade-in">
          <ReviewButtons
            intervals={intervals}
            onRate={rateCurrentCard}
          />
        </div>
      )}
    </div>
  );
}
