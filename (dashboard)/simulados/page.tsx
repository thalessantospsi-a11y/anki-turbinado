'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { questionRepository } from '@/services/firestore/questionRepository';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExamConfigModal } from '@/components/exam/ExamConfigModal';
import { MockExamConfig } from '@/types';
import { FileCheck2, Clock, HelpCircle, Sparkles, Plus, Play } from 'lucide-react';

export default function MockExamHubPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [disciplinas, setDisciplinas] = useState<string[]>([]);
  const [bancas, setBancas] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    questionRepository.filterQuestions(user.uid, {}, 100).then((qs) => {
      const dSet = new Set<string>();
      const bSet = new Set<string>();
      qs.forEach((q) => {
        if (q.metadata.disciplina) dSet.add(q.metadata.disciplina);
        if (q.metadata.banca) bSet.add(q.metadata.banca);
      });
      setDisciplinas(Array.from(dSet));
      setBancas(Array.from(bSet));
    });
  }, [user]);

  const handleStartPreset = (count: number, minutes: number, title: string) => {
    sessionStorage.setItem(
      'mock_exam_config',
      JSON.stringify({
        title,
        totalQuestions: count,
        timeLimitMinutes: minutes,
        filters: {},
      })
    );
    router.push('/simulados/prova');
  };

  const handleCustomStart = (config: MockExamConfig) => {
    sessionStorage.setItem('mock_exam_config', JSON.stringify(config));
    router.push('/simulados/prova');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-blue-600" />
            Simulados & Modo Prova Real
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Treine sob pressão de tempo com cronômetro real, mapa de itens e sem gabarito prévio.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsConfigOpen(true)}
          className="text-xs font-bold gap-1.5 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Configurar Simulado Personalizado
        </Button>
      </div>

      {/* Presets Rápidos de Prova */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Simulados Rápidos Prontos
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Preset 1: Rápido */}
          <Card className="p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="default" className="text-[10px]">Express</Badge>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5" /> 15 min
                </div>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Simulado Rápido de Fixação
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                10 questões mescladas para aquecimento ou intervalos curtos do dia.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartPreset(10, 15, 'Simulado Rápido de Fixação')}
              className="w-full font-bold text-xs gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Iniciar (10 Itens)
            </Button>
          </Card>

          {/* Preset 2: Padrão */}
          <Card className="p-5 space-y-4 hover:border-blue-300 transition-all border-blue-200/60 dark:border-blue-900/40 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="purple" className="text-[10px]">Recomendado</Badge>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5" /> 40 min
                </div>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Simulado Geral Padrão
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                20 questões distribuídas pelas suas disciplinas prioritárias.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStartPreset(20, 40, 'Simulado Geral Padrão')}
              className="w-full font-bold text-xs gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Iniciar (20 Itens)
            </Button>
          </Card>

          {/* Preset 3: Intensivo */}
          <Card className="p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="danger" className="text-[10px]">Intensivo</Badge>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5" /> 60 min
                </div>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Maratona de Concurso
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                30 questões com simulação rigorosa de ritmo de prova de banca.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartPreset(30, 60, 'Maratona de Concurso')}
              className="w-full font-bold text-xs gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Iniciar (30 Itens)
            </Button>
          </Card>
        </div>
      </div>

      {/* Dicas Pedagógicas para Simulados */}
      <Card className="p-5 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-500/20 text-xs space-y-2">
        <span className="font-bold text-blue-300 block text-xs flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Como o Modo Prova potencializa sua aprovação:
        </span>
        <p className="text-slate-300 leading-relaxed">
          Durante a prova, explicações e gabaritos ficam completamente ocultos para impedir o efeito de "falsa familiaridade". Ao final, cada questão incorreta é automaticamente registrada no Caderno de Erros com opção de inserção imediata no FSRS.
        </p>
      </Card>

      {/* Modal de Configuração Customizada */}
      <ExamConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onStartExam={handleCustomStart}
        disciplinas={disciplinas}
        bancas={bancas}
      />
    </div>
  );
}
