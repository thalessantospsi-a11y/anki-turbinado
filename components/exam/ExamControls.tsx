'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Flag, CheckCircle, AlertTriangle } from 'lucide-react';

interface ExamControlsProps {
  timeRemainingSeconds: number;
  totalQuestions: number;
  currentIndex: number;
  answers: Map<string, string>;
  flagged: Set<string>;
  questionIds: string[];
  isCurrentFlagged: boolean;
  onToggleFlag: () => void;
  onSelectIndex: (idx: number) => void;
  onFinishExam: () => void;
}

export function ExamControls({
  timeRemainingSeconds,
  totalQuestions,
  currentIndex,
  answers,
  flagged,
  questionIds,
  isCurrentFlagged,
  onToggleFlag,
  onSelectIndex,
  onFinishExam,
}: ExamControlsProps) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const hours = Math.floor(timeRemainingSeconds / 3600);
  const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
  const seconds = timeRemainingSeconds % 60;

  const formattedTime = `${hours > 0 ? `${hours}:` : ''}${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isLowTime = timeRemainingSeconds < 300; // Menos de 5 minutos
  const answeredCount = answers.size;

  return (
    <div className="space-y-4">
      {/* Barra de Cronômetro e Ações Superiores */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Cronômetro Regressivo */}
        <div className="flex items-center gap-2">
          <Clock
            className={`w-5 h-5 ${isLowTime ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}
          />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tempo Restante</span>
            <span
              className={`text-lg font-black font-mono tracking-wider ${
                isLowTime ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Botão de Marcar Dúvida e Finalizar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleFlag}
            className={`text-xs gap-1.5 font-semibold flex-1 sm:flex-initial ${
              isCurrentFlagged ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40' : ''
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-current' : ''}`} />
            {isCurrentFlagged ? 'Marcada para Revisão' : 'Marcar para Revisar'}
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="text-xs font-bold px-4 flex-1 sm:flex-initial"
          >
            Entregar Prova
          </Button>
        </div>
      </Card>

      {/* Grade / Mapa das Questões (Seção 18) */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Mapa da Prova ({answeredCount} de {totalQuestions} respondidas)
          </span>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600" /> Feita
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Marcada
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded border border-slate-300" /> Pendente
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {questionIds.map((qId, idx) => {
            const isAnswered = answers.has(qId);
            const isFlagged = flagged.has(qId);
            const isCurrent = idx === currentIndex;

            let style = 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
            if (isAnswered) {
              style = 'bg-emerald-600 text-white font-bold border-emerald-600';
            }
            if (isFlagged) {
              style = 'bg-amber-500 text-white font-bold border-amber-500';
            }

            return (
              <button
                key={qId}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className={`h-8 rounded-lg text-xs font-mono transition-all flex items-center justify-center relative ${style} ${
                  isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : ''
                }`}
              >
                {idx + 1}
                {isFlagged && (
                  <Flag className="w-2 h-2 fill-current absolute top-0.5 right-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Modal de Confirmação de Encerramento da Prova */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Finalizar Prova e Entregar Gabarito?
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Você respondeu <strong className="text-slate-800 dark:text-slate-200">{answeredCount}</strong> de{' '}
              <strong className="text-slate-800 dark:text-slate-200">{totalQuestions}</strong> questões.{' '}
              {totalQuestions - answeredCount > 0 && (
                <span className="text-red-500 font-semibold block mt-1">
                  Atenção: restam {totalQuestions - answeredCount} questão(ões) em branco!
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmOpen(false)}
              >
                Continuar Prova
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setConfirmOpen(false);
                  onFinishExam();
                }}
              >
                Confirmar e Ver Gabarito
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
