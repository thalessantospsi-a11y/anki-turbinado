'use client';

import React, { useState } from 'react';
import { MockExamConfig } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileCheck2, Clock, HelpCircle } from 'lucide-react';

interface ExamConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExam: (config: MockExamConfig) => void;
  disciplinas: string[];
  bancas: string[];
}

export function ExamConfigModal({
  isOpen,
  onClose,
  onStartExam,
  disciplinas,
  bancas,
}: ExamConfigModalProps) {
  const [title, setTitle] = useState('Simulado Personalizado');
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(60);
  const [selectedDisciplina, setSelectedDisciplina] = useState('');
  const [selectedBanca, setSelectedBanca] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartExam({
      title: title.trim(),
      totalQuestions: Number(totalQuestions),
      timeLimitMinutes: Number(timeLimitMinutes),
      filters: {
        disciplinas: selectedDisciplina ? [selectedDisciplina] : undefined,
        bancas: selectedBanca ? [selectedBanca] : undefined,
        difficulties: selectedDifficulty ? [selectedDifficulty as any] : undefined,
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Simulado / Modo Prova"
      description="Personalize o tempo, quantidade de itens e filtros para simular o ambiente real do exame."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Título do Simulado"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Número de Questões
            </label>
            <select
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
            >
              <option value={10}>10 Questões</option>
              <option value={20}>20 Questões</option>
              <option value={30}>30 Questões</option>
              <option value={50}>50 Questões</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tempo Limite
            </label>
            <select
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
            >
              <option value={15}>15 minutos (Express)</option>
              <option value={30}>30 minutos</option>
              <option value={60}>60 minutos (1 hora)</option>
              <option value={120}>120 minutos (2 horas)</option>
              <option value={240}>240 minutos (4 horas)</option>
            </select>
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Filtros Opcionais
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs text-slate-600 dark:text-slate-400">Disciplina</label>
              <select
                value={selectedDisciplina}
                onChange={(e) => setSelectedDisciplina(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
              >
                <option value="">Todas as Disciplinas</option>
                {disciplinas.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-600 dark:text-slate-400">Banca Examinadora</label>
              <select
                value={selectedBanca}
                onChange={(e) => setSelectedBanca(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
              >
                <option value="">Todas as Bancas</option>
                {bancas.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="font-bold text-xs gap-1.5">
            <FileCheck2 className="w-4 h-4" />
            Iniciar Modo Prova
          </Button>
        </div>
      </form>
    </Modal>
  );
}
