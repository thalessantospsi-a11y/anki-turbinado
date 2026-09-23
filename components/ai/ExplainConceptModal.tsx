'use client';

import React, { useState } from 'react';
import { aiService } from '@/services/gemini/aiService';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, AlertTriangle, BookOpen, Lightbulb, MessageSquare } from 'lucide-react';

interface ExplainConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  concept: string;
  context?: string;
}

export function ExplainConceptModal({
  isOpen,
  onClose,
  concept,
  context,
}: ExplainConceptModalProps) {
  const [style, setStyle] = useState<'simple' | 'exam' | 'technical' | 'analogy' | 'pitfall'>('simple');
  const [explanationData, setExplanationData] = useState<{
    explanation: string;
    keyTakeaway: string;
    samplePitfall?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExplanation = async (selectedStyle: typeof style) => {
    setStyle(selectedStyle);
    setLoading(true);
    try {
      const res = await aiService.explainConcept(concept, selectedStyle, context);
      setExplanationData(res);
    } catch (err) {
      console.error('Erro ao buscar explicação adaptativa da IA:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && concept) {
      fetchExplanation('simple');
    }
  }, [isOpen, concept]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modo Professor — Explicação Adaptativa"
      description={`Tutor pedagógico com IA explicando: "${concept}"`}
      maxWidth="lg"
    >
      <div className="space-y-4 pt-2">
        {/* Pílulas de Seleção de Estilo Pedagógico (Seção 24 do Prompt Mestre) */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'simple', label: 'Simples / Do Zero', icon: <Brain className="w-3.5 h-3.5" /> },
            { id: 'exam', label: 'Estilo Prova', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'analogy', label: 'Com Analogia', icon: <Lightbulb className="w-3.5 h-3.5" /> },
            { id: 'pitfall', label: 'Pegadinha de Banca', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
            { id: 'technical', label: 'Rigor Técnico', icon: <MessageSquare className="w-3.5 h-3.5" /> },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => fetchExplanation(pill.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all font-semibold ${
                style === pill.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {pill.icon}
              {pill.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da Explicação */}
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center space-y-2 text-xs text-slate-500">
            <Sparkles className="w-6 h-6 text-blue-600 animate-spin" />
            <span>Consultando o Professor IA...</span>
          </div>
        ) : explanationData ? (
          <div className="space-y-3 animate-fade-in text-xs sm:text-sm">
            {/* Texto Central */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {explanationData.explanation}
            </div>

            {/* Ponto-Chave para Fixação */}
            {explanationData.keyTakeaway && (
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
                <span className="font-bold block mb-0.5">💡 Ponto-Chave de Memória:</span>
                {explanationData.keyTakeaway}
              </div>
            )}

            {/* Pegadinha da Banca */}
            {explanationData.samplePitfall && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold flex items-center gap-1.5 mb-0.5 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Como a banca examinadora confunde você:
                </span>
                {explanationData.samplePitfall}
              </div>
            )}
          </div>
        ) : null}

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} size="sm">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
