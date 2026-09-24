'use client';

import React, { useState } from 'react';
import { Question, ErrorReason, ERROR_REASONS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const ConvertToCardModal = dynamic(
  () => import('./ConvertToCardModal').then((mod) => mod.ConvertToCardModal),
  { ssr: false }
);
import {
  Star,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelectOption: (id: string) => void;
  isAnswered: boolean;
  onSubmit: (optionId: string, errorReason?: ErrorReason) => void;
  onToggleFavorite: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function QuestionCardComponent({
  question,
  currentIndex,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  isAnswered,
  onSubmit,
  onToggleFavorite,
  onNext,
  onPrev,
}: QuestionCardProps) {
  const [errorReason, setErrorReason] = useState<ErrorReason>('confundi_conceitos');
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const isCorrect = isAnswered && selectedOptionId === question.correctOptionId;

  const errorReasonLabels: Record<ErrorReason, string> = {
    nao_sabia: 'Não sabia a matéria',
    esqueci: 'Esqueci o conceito',
    confundi_conceitos: 'Confundi conceitos parecidos',
    interpretacao: 'Interpretação do enunciado',
    atencao: 'Falta de atenção / Leitura rápida',
    pegadinha: 'Pegadinha da banca examinadora',
    chute: 'Chutei a resposta',
    desconhecimento_legislacao: 'Desconhecia a letra de lei',
    erro_calculo: 'Erro de cálculo',
    outro: 'Outro motivo',
  };

  const difficultyVariants: Record<string, 'success' | 'warning' | 'danger'> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger',
  };

  const difficultyLabels: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Média',
    hard: 'Difícil',
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
        {/* Cabeçalho de Metadados no Estilo Concurso Real */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              Questão {currentIndex + 1} de {totalQuestions}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            {question.metadata.banca && (
              <Badge variant="purple" className="text-[10px]">
                {question.metadata.banca}
              </Badge>
            )}
            {question.metadata.ano && (
              <Badge variant="secondary" className="text-[10px]">
                {question.metadata.ano}
              </Badge>
            )}
            {question.metadata.concurso && (
              <Badge variant="outline" className="text-[10px]">
                {question.metadata.concurso}
              </Badge>
            )}
            <Badge
              variant={difficultyVariants[question.metadata.difficulty] || 'secondary'}
              className="text-[10px]"
            >
              {difficultyLabels[question.metadata.difficulty] || 'Média'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleFavorite}
              title={question.isFavorite ? 'Remover dos favoritos' : 'Favoritar questão'}
              className={`p-1.5 rounded-lg transition-colors ${
                question.isFavorite
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Star className={`w-4 h-4 ${question.isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Matéria e Assunto */}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
            <span>{question.metadata.disciplina}</span>
            <span>›</span>
            <span>{question.metadata.assunto}</span>
            {question.metadata.subassunto && (
              <>
                <span>›</span>
                <span>{question.metadata.subassunto}</span>
              </>
            )}
          </div>

          {/* Enunciado da Prova */}
          <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed font-medium whitespace-pre-wrap">
            {question.statement}
          </div>

          {/* Lista de Alternativas (A, B, C, D, E) */}
          <div className="space-y-2.5 pt-2">
            {question.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOptionId === option.id;
              const isCorrectOption = isAnswered && option.id === question.correctOptionId;
              const isWrongSelected = isAnswered && isSelected && !isCorrectOption;

              let itemStyle = 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900';
              if (isSelected && !isAnswered) {
                itemStyle = 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20';
              } else if (isCorrectOption) {
                itemStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
              } else if (isWrongSelected) {
                itemStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-semibold';
              }

              return (
                <div
                  key={option.id}
                  onClick={() => !isAnswered && onSelectOption(option.id)}
                  className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${itemStyle}`}
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold font-mono flex-shrink-0 ${
                      isSelected && !isAnswered
                        ? 'bg-blue-600 text-white'
                        : isCorrectOption
                        ? 'bg-emerald-600 text-white'
                        : isWrongSelected
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {letter}
                  </span>

                  <div className="flex-1 leading-relaxed pt-0.5">
                    {option.text}
                  </div>

                  {isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  )}
                  {isWrongSelected && (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Botão de Responder (Antes da resposta) */}
          {!isAnswered && (
            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="md"
                disabled={!selectedOptionId}
                onClick={() => selectedOptionId && onSubmit(selectedOptionId)}
                className="font-bold px-8"
              >
                Responder Questão
              </Button>
            </div>
          )}

          {/* Painel de Gabarito e Explicação Pós-Resposta */}
          {isAnswered && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
              {/* Banner de Resultado */}
              <div
                className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                  <span>
                    {isCorrect ? 'Parabéns, você acertou!' : 'Resposta incorreta!'}
                  </span>
                </div>
                <span className="font-mono text-xs">
                  Gabarito Oficial: Letra {String.fromCharCode(65 + question.options.findIndex(o => o.id === question.correctOptionId))}
                </span>
              </div>

              {/* Registro do Motivo do Erro (Seção 13 do Prompt Mestre) */}
              {!isCorrect && (
                <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Qual foi o motivo principal do erro? (Caderno de Erros)
                  </label>
                  <select
                    value={errorReason}
                    onChange={(e) => setErrorReason(e.target.value as ErrorReason)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {ERROR_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {errorReasonLabels[r]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Explicação Teórica Completa */}
              {question.explanation && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    Comentário do Professor & Explicação
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{question.explanation}</p>
                </div>
              )}

              {/* Ação Central: Transformar em Flashcard FSRS (Seções 14 e 95) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsConvertModalOpen(true)}
                  className="font-bold text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Transformar em Flashcard FSRS
                </Button>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentIndex === 0}
                    onClick={onPrev}
                    className="text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentIndex === totalQuestions - 1}
                    onClick={onNext}
                    className="text-xs"
                  >
                    Próxima
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Conversão em Flashcard */}
      <ConvertToCardModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        question={question}
      />
    </div>
  );
}

export const QuestionCard = React.memo(QuestionCardComponent);
