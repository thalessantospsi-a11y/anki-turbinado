'use client';

import React, { useState } from 'react';
import { Card } from '@/types';
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { renderClozeFront, renderClozeBack, extractClozeIndices } from '@/lib/cloze';
import {
  RotateCcw,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  Maximize2,
  Minimize2,
  EyeOff,
} from 'lucide-react';

interface StudyCardViewProps {
  card: Card;
  isAnswerRevealed: boolean;
  onReveal: () => void;
  onSuspend: () => void;
  onAskAIExplanation?: (card: Card, mode: 'simple' | 'example' | 'analogy' | 'pitfall') => void;
}

export function StudyCardView({
  card,
  isAnswerRevealed,
  onReveal,
  onSuspend,
  onAskAIExplanation,
}: StudyCardViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const clozeIndices = card.cardType === 'cloze' ? extractClozeIndices(card.content.front) : [];
  const activeClozeIndex = clozeIndices[0] || 1;

  const renderFront = () => {
    if (card.cardType === 'cloze') {
      return renderClozeFront(card.content.front, activeClozeIndex);
    }
    return card.content.front;
  };

  const renderBack = () => {
    if (card.cardType === 'cloze') {
      const { formattedText } = renderClozeBack(card.content.front, activeClozeIndex);
      return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
    }

    if (card.cardType === 'multiple_choice' && card.content.options) {
      return (
        <div className="space-y-2 mt-3">
          {card.content.options.map((opt, idx) => {
            const isCorrect = idx === card.content.correctOptionIndex;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <span>{String.fromCharCode(65 + idx)}) {opt}</span>
                {isCorrect && <Badge variant="success" className="text-xs">Correta</Badge>}
              </div>
            );
          })}
        </div>
      );
    }

    if (card.cardType === 'true_false') {
      const isTrue = card.content.correctOptionIndex === 0;
      return (
        <div className="flex gap-4 mt-3">
          <div
            className={`flex-1 p-3 rounded-xl text-center font-bold text-sm border ${
              isTrue
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-40'
            }`}
          >
            Verdadeiro {isTrue && '✓'}
          </div>
          <div
            className={`flex-1 p-3 rounded-xl text-center font-bold text-sm border ${
              !isTrue
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-40'
            }`}
          >
            Falso {!isTrue && '✓'}
          </div>
        </div>
      );
    }

    return card.content.back;
  };

  return (
    <UICard className="w-full max-w-3xl mx-auto shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Topo do Cartão: Metadados e Ações Rápidas */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="default" className="text-[10px]">
            {card.metadata.disciplina}
          </Badge>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            {card.metadata.assunto}
          </span>
          {card.metadata.banca && (
            <Badge variant="secondary" className="text-[10px]">
              {card.metadata.banca}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Diminuir' : 'Expandir cartão'}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onSuspend}
            title="Suspender cartão (Tecla: S)"
            className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      <CardContent className={`p-6 sm:p-8 space-y-6 ${isExpanded ? 'min-h-[480px]' : 'min-h-[300px]'}`}>
        {/* FRENTE DO CARTÃO */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400 block">
            Pergunta / Conceito
          </span>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">
            {renderFront()}
          </div>
        </div>

        {/* BOTÃO MOSTRAR RESPOSTA */}
        {!isAnswerRevealed && (
          <div className="pt-6 flex flex-col items-center justify-center gap-2">
            <Button
              size="lg"
              variant="primary"
              onClick={onReveal}
              className="w-full sm:w-auto px-8 py-3.5 font-bold shadow-lg shadow-blue-500/20 text-sm"
            >
              Mostrar Resposta (Espaço)
            </Button>
            <span className="text-[11px] text-slate-400">
              Pressione a barra de espaço para virar
            </span>
          </div>
        )}

        {/* VERSO E EXPLICAÇÕES (QUANDO REVELADO) */}
        {isAnswerRevealed && (
          <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 block">
                Resposta Correta
              </span>
              <div className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-medium whitespace-pre-wrap">
                {renderBack()}
              </div>
            </div>

            {/* Informações Complementares Didáticas */}
            {card.content.explanation && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Explicação Teórica
                </div>
                <p className="leading-relaxed">{card.content.explanation}</p>
              </div>
            )}

            {card.content.pitfall && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  Pegadinha Típica da Banca
                </div>
                <p className="leading-relaxed">{card.content.pitfall}</p>
              </div>
            )}

            {card.content.example && (
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-bold flex items-center gap-1 mb-0.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Exemplo Prático:
                </span>
                {card.content.example}
              </div>
            )}

            {/* Recursos de IA: Modo "Me Ensine" e "Ver Pegadinha" */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAskAIExplanation?.(card, 'simple')}
                  className="text-xs font-semibold gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Não entendi (Me Ensine)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAskAIExplanation?.(card, 'pitfall')}
                  className="text-xs font-semibold gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Como a banca confunde?
                </Button>
              </div>

              {card.content.source && (
                <span className="text-[11px] text-slate-400 italic">
                  Fonte: {card.content.source.title}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </UICard>
  );
}
