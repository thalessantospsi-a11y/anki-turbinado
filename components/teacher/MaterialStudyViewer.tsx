'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Network, AlertTriangle, HelpCircle, Copy, CheckCircle2 } from 'lucide-react';

interface MaterialStudyViewerProps {
  track: string;
  data: any;
  onSaveQuestions?: (questions: any[]) => void;
  onOpenFlashcardsReview?: () => void;
}

export function MaterialStudyViewer({
  track,
  data,
  onSaveQuestions,
  onOpenFlashcardsReview,
}: MaterialStudyViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) return null;

  return (
    <Card className="shadow-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-fade-in">
      {/* 1. Visão de Resumo Estruturado */}
      {track === 'summary' && (
        <>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <CardTitle className="text-base font-bold">{data.title || 'Resumo Estruturado'}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(data.bulletPoints?.join('\n') || '')}
                className="text-xs"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copiado!' : 'Copiar Resumo'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs sm:text-sm">
            <div className="space-y-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs block">
                Pontos Centrais do Material
              </span>
              <ul className="space-y-2 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.bulletPoints?.map((bp: string, i: number) => (
                  <li key={i} className="pl-1">{bp}</li>
                ))}
              </ul>
            </div>

            {data.keyTakeaways && data.keyTakeaways.length > 0 && (
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1.5">
                <span className="font-bold text-blue-900 dark:text-blue-200 block text-xs">
                  💡 Fixação Rápida para Prova:
                </span>
                <ul className="list-disc list-inside text-blue-800 dark:text-blue-300 text-xs space-y-1">
                  {data.keyTakeaways.map((kt: string, i: number) => (
                    <li key={i}>{kt}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </>
      )}

      {/* 2. Visão de Mapa Mental Textual */}
      {track === 'mindmap' && (
        <>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-base font-bold">
                Mapa Conceitual Hierárquico: {data.centralTopic}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs sm:text-sm">
            <div className="space-y-3 font-mono">
              {data.branches?.map((b: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="font-bold text-purple-700 dark:text-purple-300 text-sm block">
                    ┌── {b.name}
                  </span>
                  <div className="pl-6 space-y-1 text-slate-600 dark:text-slate-300">
                    {b.subbranches?.map((sb: string, j: number) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <span className="text-slate-400">├──</span>
                        <span>{sb}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </>
      )}

      {/* 3. Visão de Pegadinhas de Banca */}
      {track === 'pitfalls' && (
        <>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-base font-bold">
                Armadilhas Frequentes de Bancas Examinadoras
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-3 text-xs sm:text-sm">
            {data.pitfalls?.map((p: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/30 dark:bg-amber-950/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                    {p.topic}
                  </span>
                  <Badge variant="warning" className="text-[10px]">Armadilha</Badge>
                </div>
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <p><strong className="text-slate-900 dark:text-white">O que a banca faz:</strong> {p.whatExaminerDoes}</p>
                  <p className="text-emerald-700 dark:text-emerald-400"><strong className="text-emerald-800 dark:text-emerald-300">Como não cair:</strong> {p.howToNotFall}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </>
      )}

      {/* 4. Visão de Questões Inéditas */}
      {track === 'questions' && (
        <>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-base font-bold">
                  Questões Inéditas Geradas ({data.questions?.length || 0})
                </CardTitle>
              </div>
              {onSaveQuestions && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSaveQuestions(data.questions)}
                  className="text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Salvar Questões no Meu Banco
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {data.questions?.map((q: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 text-xs sm:text-sm"
              >
                <span className="font-bold text-blue-600 font-mono">Questão #{i + 1}</span>
                <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {q.statement}
                </p>
                <div className="space-y-1.5 pl-2">
                  {q.options?.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`p-2 rounded-lg border flex items-center gap-2 ${
                        opt.id === q.correctOptionId
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="font-bold font-mono">{opt.id})</span>
                      <span>{opt.text}</span>
                      {opt.id === q.correctOptionId && (
                        <Badge variant="success" className="ml-auto text-[10px]">Gabarito</Badge>
                      )}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <strong>Comentário:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </>
      )}
    </Card>
  );
}
