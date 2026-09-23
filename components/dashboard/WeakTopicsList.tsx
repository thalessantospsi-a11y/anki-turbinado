'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeakTopicVerdict } from '@/core/analytics/types';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface WeakTopicsListProps {
  topics: WeakTopicVerdict[];
}

export function WeakTopicsList({ topics }: WeakTopicsListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Assuntos que Merecem Atenção</CardTitle>
              <CardDescription>
                Identificados automaticamente com base na taxa de acerto e retenção FSRS.
              </CardDescription>
            </div>
          </div>
          <Badge variant="warning" className="text-xs">
            {topics.length} prioritário{topics.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {topics.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold">Nenhum ponto crítico detectado no momento!</p>
              <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                Sua retenção média está equilibrada. Continue praticando para refinar o modelo.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, idx) => (
              <div
                key={`${topic.disciplina}-${topic.assunto}-${idx}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {topic.disciplina}
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {topic.assunto}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {topic.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href={`/questoes?disciplina=${encodeURIComponent(topic.disciplina)}&assunto=${encodeURIComponent(topic.assunto)}`}
                  >
                    <Button variant="outline" size="sm" className="text-xs font-medium">
                      Praticar Questões
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
