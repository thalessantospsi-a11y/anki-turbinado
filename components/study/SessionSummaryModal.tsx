'use client';

import React from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, Clock, RotateCcw, ArrowRight } from 'lucide-react';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  durationMinutes: number;
  ratingsCount: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

export function SessionSummaryModal({
  isOpen,
  onClose,
  durationMinutes,
  ratingsCount,
}: SessionSummaryModalProps) {
  const totalReviewed =
    ratingsCount.again + ratingsCount.hard + ratingsCount.good + ratingsCount.easy;
  const successfulReviews = ratingsCount.good + ratingsCount.easy;
  const retentionRate =
    totalReviewed > 0 ? Math.round((successfulReviews / totalReviewed) * 100) : 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sessão de Revisão Concluída!"
      description="Parabéns pela dedicação. Seus intervalos FSRS foram atualizados."
      maxWidth="md"
    >
      <div className="space-y-6 pt-2 text-center">
        {/* Ícone de Troféu */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>

        {/* Métricas da Sessão */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Tempo Estudado
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {durationMinutes} min
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
              Cartões Revisados
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {totalReviewed}
            </span>
          </div>
        </div>

        {/* Distribuição de Respostas FSRS */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Retenção da Sessão</span>
            <span className="text-emerald-600 font-extrabold">{retentionRate}%</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
              <span className="block font-bold text-red-600">{ratingsCount.again}</span>
              <span className="text-[10px] text-red-500">Again</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <span className="block font-bold text-amber-600">{ratingsCount.hard}</span>
              <span className="text-[10px] text-amber-500">Hard</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <span className="block font-bold text-emerald-600">{ratingsCount.good}</span>
              <span className="text-[10px] text-emerald-500">Good</span>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
              <span className="block font-bold text-blue-600">{ratingsCount.easy}</span>
              <span className="text-[10px] text-blue-500">Easy</span>
            </div>
          </div>
        </div>

        {/* Botão de Fechamento */}
        <div className="flex gap-2 pt-2">
          <Link href="/" className="w-full">
            <Button variant="primary" className="w-full font-bold">
              Voltar para Dashboard
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
