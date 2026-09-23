'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuestionAttempt } from '@/types';
import { AlertTriangle, PlusCircle, ArrowRight } from 'lucide-react';

interface RecentErrorsSummaryProps {
  attempts: QuestionAttempt[];
}

export function RecentErrorsSummary({ attempts }: RecentErrorsSummaryProps) {
  const errorReasonLabels: Record<string, string> = {
    nao_sabia: 'Não sabia',
    esqueci: 'Esqueci',
    confundi_conceitos: 'Confundi conceitos',
    interpretacao: 'Interpretação',
    atencao: 'Falta de atenção',
    pegadinha: 'Pegadinha',
    chute: 'Chute',
    desconhecimento_legislacao: 'Legislação',
    erro_calculo: 'Cálculo',
    outro: 'Outro',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Últimos Erros em Questões</CardTitle>
              <CardDescription>
                Converta erros em flashcards FSRS para fixar os conceitos cobrados.
              </CardDescription>
            </div>
          </div>
          <Link href="/caderno-erros">
            <Button variant="ghost" size="sm" className="text-xs">
              Ver Todos
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {attempts.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
            Nenhum erro registrado recentemente nas questões.
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Questão #{attempt.questionId.slice(0, 6)}
                    </span>
                    {attempt.errorDetails?.reason && (
                      <Badge variant="danger" className="text-[10px]">
                        {errorReasonLabels[attempt.errorDetails.reason] || attempt.errorDetails.reason}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Tempo de resposta: {attempt.timeSpentSeconds}s
                  </p>
                </div>

                <Link
                  href={`/caderno-erros?attemptId=${attempt.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-500 font-semibold"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Gerar Card</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
