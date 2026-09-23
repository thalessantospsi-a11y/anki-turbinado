'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMockExam } from '@/hooks/useMockExam';
import { ExamControls } from '@/components/exam/ExamControls';
import { ExamResultsReport } from '@/components/exam/ExamResultsReport';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function ExamSessionPage() {
  const router = useRouter();
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('mock_exam_config');
    if (raw) {
      try {
        setConfig(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedOptionId,
    isFlagged,
    answers,
    flagged,
    timeRemainingSeconds,
    isFinished,
    results,
    loading,
    selectOption,
    toggleFlag,
    setCurrentIndex,
    finishExam,
  } = useMockExam(config);

  if (!config) {
    return (
      <div className="py-12">
        <EmptyState
          title="Nenhum simulado ativo"
          description="Selecione um simulado no Hub para iniciar sua sessão de prova."
          action={
            <Link href="/simulados">
              <Button variant="primary">Ir para o Hub de Simulados</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) {
    return <LoadingState message="Montando seu caderno de prova e cronômetro..." />;
  }

  // Fim de Prova: Relatório Analítico Pós-Prova (Seção 18)
  if (isFinished && results) {
    return <ExamResultsReport results={results} />;
  }

  if (!currentQuestion) {
    return (
      <div className="py-12">
        <EmptyState
          title="Banco insuficiente para os filtros"
          description="Não encontramos questões suficientes cadastradas com os filtros selecionados para este simulado."
          action={
            <Link href="/simulados">
              <Button variant="outline">Voltar e Ajustar Filtros</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const questionIds = questions.map((q) => q.id);

  return (
    <div className="space-y-5 max-w-4xl mx-auto animate-fade-in">
      {/* Controles de Prova: Cronômetro e Mapa */}
      <ExamControls
        timeRemainingSeconds={timeRemainingSeconds}
        totalQuestions={totalQuestions}
        currentIndex={currentIndex}
        answers={answers}
        flagged={flagged}
        questionIds={questionIds}
        isCurrentFlagged={isFlagged}
        onToggleFlag={toggleFlag}
        onSelectIndex={setCurrentIndex}
        onFinishExam={finishExam}
      />

      {/* Caderno da Questão Ativa (Modo Prova Estrito — Sem Gabarito Antecipado) */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              Questão {currentIndex + 1} de {totalQuestions}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {currentQuestion.metadata.disciplina} › {currentQuestion.metadata.assunto}
            </span>
          </div>

          {currentQuestion.metadata.banca && (
            <Badge variant="secondary" className="text-[10px]">
              {currentQuestion.metadata.banca}
            </Badge>
          )}
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Enunciado */}
          <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed font-medium whitespace-pre-wrap">
            {currentQuestion.statement}
          </div>

          {/* Alternativas de Resposta */}
          <div className="space-y-2.5 pt-2">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOptionId === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => selectOption(option.id)}
                  className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold font-mono flex-shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {letter}
                  </span>

                  <div className="flex-1 leading-relaxed pt-0.5">
                    {option.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navegação entre Questões */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Anterior
            </Button>

            <span className="text-xs text-slate-400 font-mono">
              {currentIndex + 1} / {totalQuestions}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentIndex === totalQuestions - 1}
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="text-xs"
            >
              Próxima
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
