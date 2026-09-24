'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExamResultsData } from '@/hooks/useMockExam';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const ConvertToCardModal = dynamic(
  () => import('@/components/questions/ConvertToCardModal').then((mod) => mod.ConvertToCardModal),
  { ssr: false }
);
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface ExamResultsReportProps {
  results: ExamResultsData;
  onRestart?: () => void;
}

export function ExamResultsReport({ results, onRestart }: ExamResultsReportProps) {
  const [selectedQuestionForCard, setSelectedQuestionForCard] = useState<any>(null);

  const isApproved = results.scorePercentage >= 70;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* 1. Banner Principal de Pontuação */}
      <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md text-center space-y-4">
        <div
          className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
            isApproved
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
          }`}
        >
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            Relatório de Desempenho no Simulado
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
            {results.scorePercentage}% de Aproveitamento
          </h2>
          <p className="text-xs text-slate-500">
            {isApproved
              ? 'Excelente aproveitamento! Seu desempenho demonstra consistência competitiva.'
              : 'Bom treinamento. Foque a revisão nas matérias com taxa inferior a 70%.'}
          </p>
        </div>

        {/* 4 Indicadores Rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block">Tempo Total</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {results.timeSpentMinutes} min
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">Acertos</span>
            <span className="text-lg font-black text-emerald-600 font-mono">
              {results.correctCount} / {results.totalQuestions}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
            <span className="text-[11px] text-red-700 dark:text-red-400 block">Erros</span>
            <span className="text-lg font-black text-red-600 font-mono">
              {results.wrongCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
            <span className="text-[11px] text-blue-700 dark:text-blue-400 block">Respondidas</span>
            <span className="text-lg font-black text-blue-600 font-mono">
              {results.answeredCount}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Desempenho por Disciplina (Seção 17) */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Desempenho por Disciplina
        </h3>

        <div className="space-y-3">
          {results.disciplines.map((d) => (
            <div key={d.disciplina} className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800 dark:text-slate-200">{d.disciplina}</span>
                <span className="font-mono">{d.correct}/{d.total} ({d.pct}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    d.pct >= 70 ? 'bg-emerald-500' : d.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${d.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Questões Erradas com Ação de Conversão em Flashcard FSRS */}
      {results.wrongQuestions.length > 0 && (
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-500" />
                Questões que Você Errou ({results.wrongQuestions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Transforme os erros desta prova em cartões FSRS para fechar a lacuna de conteúdo.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {results.wrongQuestions.map(({ question, selectedOptionId }, idx) => {
              const selectedOpt = question.options.find((o) => o.id === selectedOptionId);
              const correctOpt = question.options.find((o) => o.id === question.correctOptionId);

              return (
                <div
                  key={question.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600 font-mono">
                      Questão #{idx + 1} • {question.metadata.disciplina} › {question.metadata.assunto}
                    </span>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedQuestionForCard(question)}
                      className="text-xs font-bold gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Gerar Card FSRS
                    </Button>
                  </div>

                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {question.statement}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                      Sua resposta: {selectedOpt?.text}
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                      Gabarito: {correctOpt?.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Botões do Rodapé do Relatório */}
      <div className="flex gap-3 justify-center pt-2">
        <Link href="/simulados">
          <Button variant="outline" className="font-semibold text-xs">
            Voltar aos Simulados
          </Button>
        </Link>
        <Link href="/">
          <Button variant="primary" className="font-bold text-xs gap-1">
            Ir para Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Modal de Conversão se o Aluno Clicar em Alguma Questão */}
      {selectedQuestionForCard && (
        <ConvertToCardModal
          isOpen={true}
          onClose={() => setSelectedQuestionForCard(null)}
          question={selectedQuestionForCard}
        />
      )}
    </div>
  );
}
