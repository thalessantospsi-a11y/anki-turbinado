'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  HelpCircle,
  FileText,
  Network,
  AlertTriangle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface TeacherOptionsGridProps {
  topics: { title: string; summary: string }[];
  activeTrack: string | null;
  onSelectTrack: (track: string) => void;
  isLoading: boolean;
}

export function TeacherOptionsGrid({
  topics,
  activeTrack,
  onSelectTrack,
  isLoading,
}: TeacherOptionsGridProps) {
  const tracks = [
    {
      id: 'flashcards',
      title: 'Flashcards FSRS',
      desc: 'Gera cartões atômicos e omissão de lacuna (Cloze) para memorização ativa.',
      icon: <RotateCcw className="w-5 h-5 text-blue-600" />,
      badge: 'FSRS Automático',
    },
    {
      id: 'questions',
      title: 'Questões Inéditas',
      desc: 'Simula itens de prova de concurso com 4-5 alternativas e gabarito comentado.',
      icon: <HelpCircle className="w-5 h-5 text-emerald-600" />,
      badge: 'Estilo Prova',
    },
    {
      id: 'summary',
      title: 'Resumo Estruturado',
      desc: 'Pontos mais importantes e diretrizes de revisão rápida.',
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      badge: 'Alto Rendimento',
    },
    {
      id: 'mindmap',
      title: 'Mapa Mental Textual',
      desc: 'Organização hierárquica e conexões entre conceitos em lista multinível.',
      icon: <Network className="w-5 h-5 text-purple-600" />,
      badge: 'Visão Panorâmica',
    },
    {
      id: 'pitfalls',
      title: 'Pegadinhas & Armadilhas',
      desc: 'Como examinadores de concurso costumam trocar termos para induzir ao erro.',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      badge: 'Atenção Total',
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Tópicos Identificados (Seções 70 e 96) */}
      {topics.length > 0 && (
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
          <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            O Professor IA analisou seu material e identificou {topics.length} tópicos fundamentais:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {topics.map((t, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 text-xs"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {t.title}
                </span>
                <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {t.summary}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Opções Pedagógicas */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          Como você deseja estudar este conteúdo agora?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tracks.map((track) => {
            const isSelected = activeTrack === track.id;

            return (
              <Card
                key={track.id}
                onClick={() => !isLoading && onSelectTrack(track.id)}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-md'
                    : 'hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {track.icon}
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {track.badge}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {track.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {track.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
