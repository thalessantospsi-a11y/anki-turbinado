'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { updateUserProfile } from '@/services/firebase/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const OBJECTIVES = [
  { id: 'concurso', label: 'Concurso Público', icon: '🏛️' },
  { id: 'vestibular', label: 'Vestibular / ENEM', icon: '🎓' },
  { id: 'faculdade', label: 'Graduação / Pós', icon: '📚' },
  { id: 'certificacao', label: 'Certificação Profissional', icon: '💼' },
  { id: 'outro', label: 'Outro Objetivo', icon: '🎯' },
];

const TIME_OPTIONS = [
  { minutes: 30, label: '30 min/dia', desc: 'Ritmo moderado e contínuo' },
  { minutes: 60, label: '1 hora/dia', desc: 'Recomendado para consistência' },
  { minutes: 120, label: '2 horas/dia', desc: 'Preparação intensiva' },
  { minutes: 240, label: '4+ horas/dia', desc: 'Dedicação exclusiva' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState('concurso');
  const [targetExam, setTargetExam] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [studyMinutes, setStudyMinutes] = useState(60);
  const [disciplinesInput, setDisciplinesInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleFinish = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        targetExam: targetExam.trim() || objective,
        targetRole: targetRole.trim(),
        goals: {
          dailyStudyMinutes: studyMinutes,
          dailyNewCards: 20,
          dailyMaxReviews: 100,
          dailyQuestions: 30,
        },
      });
      await refreshProfile();
      router.push('/');
    } catch (error) {
      console.error('Erro ao salvar onboarding:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Progresso do Wizard */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
          <span>Etapa {step} de 3</span>
          <span>{step === 1 ? 'Objetivo' : step === 2 ? 'Foco & Prova' : 'Rotina & Metas'}</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* ETAPA 1: OBJETIVO */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Qual é o seu objetivo de estudo?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Personalizaremos sua estrutura de baralhos e repetições.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-2">
            {OBJECTIVES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setObjective(item.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  objective === item.id
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <Button
            type="button"
            className="w-full mt-4"
            onClick={() => setStep(2)}
          >
            Avançar
          </Button>
        </div>
      )}

      {/* ETAPA 2: FOCO & PROVA */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {objective === 'concurso' ? 'Qual concurso você visa?' : 'Qual o seu foco principal?'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Isso ativa a organização hierárquica por banca, cargo e matéria.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Input
              label={objective === 'concurso' ? 'Órgão / Concurso' : 'Curso ou Prova'}
              placeholder={objective === 'concurso' ? 'Ex: TJCE, Polícia Federal, Receita Federal' : 'Ex: Medicina, OAB, Residência'}
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
            />

            {objective === 'concurso' && (
              <Input
                label="Cargo pretendido (Opcional)"
                placeholder="Ex: Analista Judiciário — Psicologia"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            )}

            <Input
              label="Principais disciplinas a estudar"
              placeholder="Ex: Português, Direito Constitucional, Psicologia"
              value={disciplinesInput}
              onChange={(e) => setDisciplinesInput(e.target.value)}
              helperText="Separe por vírgulas. Criaremos baralhos sugeridos."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-1/3"
              onClick={() => setStep(1)}
            >
              Voltar
            </Button>
            <Button
              type="button"
              className="w-2/3"
              onClick={() => setStep(3)}
            >
              Avançar
            </Button>
          </div>
        </div>
      )}

      {/* ETAPA 3: TEMPO E METAS DIÁRIAS */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quanto tempo você quer estudar por dia?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              O ANKI TURBINADO ajustará a carga de revisões FSRS e novas cartas para evitar sobrecarga.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-2">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.minutes}
                type="button"
                onClick={() => setStudyMinutes(opt.minutes)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  studyMinutes === opt.minutes
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="text-sm font-semibold">{opt.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-1/3"
              onClick={() => setStep(2)}
            >
              Voltar
            </Button>
            <Button
              type="button"
              className="w-2/3"
              onClick={handleFinish}
              isLoading={isSaving}
            >
              Concluir e Começar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
