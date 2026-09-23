'use client';

import React from 'react';
import { BancaStatItem } from '@/hooks/useDetailedStats';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, AlertCircle } from 'lucide-react';

interface StatsByBancaCardProps {
  bancas: BancaStatItem[];
}

export function StatsByBancaCard({ bancas }: StatsByBancaCardProps) {
  if (bancas.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
        Nenhuma questão associada a uma banca examinadora foi respondida ainda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300">
        <p className="font-semibold text-blue-900 dark:text-blue-200 mb-0.5">
          Comparações Descritivas de Bancas Examinadoras (Seção 32)
        </p>
        <p className="text-[11px] text-slate-500">
          Análises estatísticas exigem rigor metodológico. Resultados com menos de 10 questões possuem caráter meramente descritivo preliminar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bancas.map((b) => (
          <Card key={b.banca} className="p-5 space-y-3 hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  {b.banca}
                </h4>
                <span className="text-[11px] text-slate-400">
                  {b.cardsTotal} flashcards relacionados
                </span>
              </div>
              <Badge
                variant={b.accuracyRate >= 70 ? 'success' : 'warning'}
                className="text-xs font-mono font-bold"
              >
                {b.accuracyRate}% acertos
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="block font-black text-slate-800 dark:text-slate-200 text-sm">
                  {b.questionsTotal}
                </span>
                <span className="text-[10px] text-slate-400">Questões Respondidas</span>
              </div>
              <div>
                <span className="block font-black text-emerald-600 text-sm">
                  {b.questionsCorrect}
                </span>
                <span className="text-[10px] text-slate-400">Acertos Confirmados</span>
              </div>
            </div>

            {b.isSmallSample && (
              <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Amostra preliminar (&lt; 10 questões). Resolva mais itens.</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
