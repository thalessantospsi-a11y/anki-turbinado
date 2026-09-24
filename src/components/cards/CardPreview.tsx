'use client';

import React, { useState } from 'react';
import { CardType, CardContent, CardMetadata } from '@/types';
import { Card, CardHeader, CardTitle, CardContent as UICardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { renderClozeFront, renderClozeBack, extractClozeIndices } from '@/lib/cloze';
import { Eye, RotateCcw, AlertTriangle, BookOpen, Lightbulb } from 'lucide-react';

interface CardPreviewProps {
  cardType: CardType;
  content: CardContent;
  metadata?: Partial<CardMetadata>;
}

export function CardPreview({ cardType, content, metadata }: CardPreviewProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [reversedFlip, setReversedFlip] = useState(false); // Para cartão reverso

  const clozeIndices = cardType === 'cloze' ? extractClozeIndices(content.front) : [];
  const activeClozeIndex = clozeIndices[0] || 1;

  const renderFront = () => {
    if (cardType === 'reversed' && reversedFlip) {
      return content.back || 'Verso do cartão (vazio)';
    }

    if (cardType === 'cloze') {
      return renderClozeFront(content.front || 'Insira texto com {{c1::lacuna}}', activeClozeIndex);
    }

    return content.front || 'Frente do cartão (pergunta ou enunciado)...';
  };

  const renderBack = () => {
    if (cardType === 'reversed' && reversedFlip) {
      return content.front;
    }

    if (cardType === 'cloze') {
      const { formattedText } = renderClozeBack(content.front, activeClozeIndex);
      return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
    }

    if (cardType === 'multiple_choice' && content.options) {
      return (
        <div className="space-y-2 mt-2">
          {content.options.map((opt, idx) => {
            const isCorrect = idx === content.correctOptionIndex;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{String.fromCharCode(65 + idx)}) {opt}</span>
                {isCorrect && <Badge variant="success" className="text-[10px]">Correta</Badge>}
              </div>
            );
          })}
        </div>
      );
    }

    if (cardType === 'true_false') {
      const isTrue = content.correctOptionIndex === 0;
      return (
        <div className="flex gap-3 mt-3">
          <div
            className={`flex-1 p-2.5 rounded-lg text-center font-bold text-xs border ${
              isTrue
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-400 opacity-50'
            }`}
          >
            Verdadeiro {isTrue && '✓'}
          </div>
          <div
            className={`flex-1 p-2.5 rounded-lg text-center font-bold text-xs border ${
              !isTrue
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-400 opacity-50'
            }`}
          >
            Falso {!isTrue && '✓'}
          </div>
        </div>
      );
    }

    return content.back || 'Verso do cartão (resposta)...';
  };

  return (
    <Card className="border-2 border-dashed border-blue-200 dark:border-blue-900/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm font-bold">Pré-visualização em Tempo Real</CardTitle>
          </div>
          <Badge variant="purple" className="text-[10px] uppercase font-mono">
            {cardType}
          </Badge>
        </div>
      </CardHeader>

      <UICardContent className="p-5 space-y-4">
        {/* Metadados do topo */}
        {metadata && (
          <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
            {metadata.disciplina && <Badge variant="default" className="text-[10px]">{metadata.disciplina}</Badge>}
            {metadata.assunto && <Badge variant="secondary" className="text-[10px]">{metadata.assunto}</Badge>}
            {metadata.banca && <Badge variant="outline" className="text-[10px]">{metadata.banca}</Badge>}
          </div>
        )}

        {/* LADO FRENTE */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
            {cardType === 'reversed' && reversedFlip ? 'Frente (Sentido Reverso: Resposta)' : 'Frente (Pergunta)'}
          </span>
          <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
            {renderFront()}
          </div>
        </div>

        {/* Ação Mostrar Resposta */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant={showAnswer ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setShowAnswer(!showAnswer)}
            className="text-xs font-semibold"
          >
            {showAnswer ? 'Ocultar Resposta' : 'Mostrar Resposta'}
          </Button>

          {cardType === 'reversed' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReversedFlip(!reversedFlip)}
              className="text-xs text-slate-500"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Inverter Sentido
            </Button>
          )}
        </div>

        {/* LADO VERSO (QUANDO REVELADO) */}
        {showAnswer && (
          <div className="space-y-3 pt-2 animate-fade-in">
            <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/60">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 block mb-1">
                Verso (Resposta)
              </span>
              <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                {renderBack()}
              </div>
            </div>

            {/* Informações Auxiliares */}
            {content.explanation && (
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-slate-800 dark:text-slate-200">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  Explicação Didática:
                </div>
                {content.explanation}
              </div>
            )}

            {content.example && (
              <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                  Exemplo Prático:
                </div>
                {content.example}
              </div>
            )}

            {content.pitfall && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Como a Banca Costuma Confundir (Pegadinha):
                </div>
                {content.pitfall}
              </div>
            )}

            {content.source && (
              <div className="text-[11px] text-slate-400 italic">
                Fonte: {content.source.title} {content.source.pageOrSection ? `(${content.source.pageOrSection})` : ''}
              </div>
            )}
          </div>
        )}
      </UICardContent>
    </Card>
  );
}
