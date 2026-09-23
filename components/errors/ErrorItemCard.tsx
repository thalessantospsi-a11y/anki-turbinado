'use client';

import React, { useState } from 'react';
import { EnrichedErrorEntry } from '@/hooks/useErrorNotebook';
import { ErrorReason, ERROR_REASONS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const ConvertToCardModal = dynamic(
  () => import('@/components/questions/ConvertToCardModal').then((mod) => mod.ConvertToCardModal),
  { ssr: false }
);
import {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface ErrorItemCardProps {
  entry: EnrichedErrorEntry;
  onUpdateReason: (attemptId: string, reason: ErrorReason, notes?: string) => Promise<void>;
}

function ErrorItemCardComponent({ entry, onUpdateReason }: ErrorItemCardProps) {
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isEditingReason, setIsEditingReason] = useState(false);
  const [reason, setReason] = useState<ErrorReason>(
    entry.attempt.errorDetails?.reason || 'confundi_conceitos'
  );

  const errorReasonLabels: Record<string, string> = {
    nao_sabia: 'Não sabia',
    esqueci: 'Esqueci',
    confundi_conceitos: 'Confundi conceitos',
    interpretacao: 'Interpretação',
    atencao: 'Falta de atenção',
    pegadinha: 'Pegadinha de banca',
    chute: 'Chute',
    desconhecimento_legislacao: 'Legislação',
    erro_calculo: 'Cálculo',
    outro: 'Outro',
  };

  const handleReasonChange = async (newReason: ErrorReason) => {
    setReason(newReason);
    await onUpdateReason(entry.attempt.id, newReason);
    setIsEditingReason(false);
  };

  const dateFormatted = new Date(entry.attempt.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Cabeçalho do Erro: Disciplina, Banca e Motivo */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="default" className="text-[10px]">
              {entry.question.metadata.disciplina}
            </Badge>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {entry.question.metadata.assunto}
            </span>
            {entry.question.metadata.banca && (
              <Badge variant="secondary" className="text-[10px]">
                {entry.question.metadata.banca}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dateFormatted}</span>
          </div>
        </div>

        {/* Enunciado da Questão Errada */}
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
          {entry.question.statement}
        </div>

        {/* Comparação: O que marcou vs Gabarito Oficial */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Alternativa Marcada Incorreta */}
          <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Sua Escolha (Incorreta)
            </span>
            <p className="text-red-900 dark:text-red-200 font-medium">
              {entry.selectedOptionText}
            </p>
          </div>

          {/* Gabarito Correto */}
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Gabarito Oficial
            </span>
            <p className="text-emerald-900 dark:text-emerald-200 font-medium">
              {entry.correctOptionText}
            </p>
          </div>
        </div>

        {/* Explicação da Questão */}
        {entry.question.explanation && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              Por que a alternativa correta é essa:
            </div>
            <p className="leading-relaxed">{entry.question.explanation}</p>
          </div>
        )}

        {/* Rodapé: Classificação do Motivo e Ação do Loop FSRS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Diagnóstico do Erro */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Motivo diagnosticado:</span>
            {isEditingReason ? (
              <select
                value={reason}
                onChange={(e) => handleReasonChange(e.target.value as ErrorReason)}
                className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
              >
                {ERROR_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {errorReasonLabels[r]}
                  </option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingReason(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/60"
                title="Clique para reclassificar o motivo do erro"
              >
                <AlertTriangle className="w-3 h-3" />
                {errorReasonLabels[reason] || reason} (alterar)
              </button>
            )}
          </div>

          {/* Status do Loop de Reforço FSRS */}
          <div className="flex items-center gap-2">
            {entry.hasGeneratedCard ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Reforço FSRS Ativo
              </span>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsConvertModalOpen(true)}
                className="text-xs font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Gerar Flashcard FSRS
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Modal de Conversão vinculado a esta tentativa */}
      <ConvertToCardModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        question={entry.question}
        attemptId={entry.attempt.id}
      />
    </Card>
  );
}

export const ErrorItemCard = React.memo(ErrorItemCardComponent);
