'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FSRS_PRESETS, estimateWorkloadMultiplier } from '@/core/fsrs/parameters';
import { updateUserProfile } from '@/services/firebase/authService';
import { Sliders, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function FSRSSettingsCard() {
  const { user, profile, refreshProfile } = useAuth();

  const [retention, setRetention] = useState(
    profile?.fsrsParameters?.requestRetention ?? 0.90
  );
  const [maxInterval, setMaxInterval] = useState(
    profile?.fsrsParameters?.maximumInterval ?? 36500
  );
  const [dailyNewCards, setDailyNewCards] = useState(
    profile?.goals?.dailyNewCards ?? 20
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setRetention(profile.fsrsParameters.requestRetention);
      setMaxInterval(profile.fsrsParameters.maximumInterval);
      setDailyNewCards(profile.goals.dailyNewCards);
    }
  }, [profile]);

  const workloadMultiplier = estimateWorkloadMultiplier(retention);

  const handleApplyPreset = (presetKey: keyof typeof FSRS_PRESETS) => {
    const p = FSRS_PRESETS[presetKey];
    setRetention(p.requestRetention);
    setMaxInterval(p.maximumInterval);
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        fsrsParameters: {
          ...profile.fsrsParameters,
          requestRetention: Number(retention),
          maximumInterval: Number(maxInterval),
        },
        goals: {
          ...profile.goals,
          dailyNewCards: Number(dailyNewCards),
        },
      });
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar parâmetros FSRS:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Parâmetros do Motor FSRS v4.5</CardTitle>
              <CardDescription>
                Ajuste fino da curva de retenção matemática e controle de sobrecarga de revisões.
              </CardDescription>
            </div>
          </div>
          <Badge variant="purple" className="text-xs font-mono">
            FSRS 4.5
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 1. Presets Rápidos */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Estratégias Pré-definidas
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Object.values(FSRS_PRESETS).map((preset) => {
              const isSelected = retention === preset.requestRetention;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {preset.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block line-clamp-2">
                    {preset.description}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-2 block">
                    {preset.estimatedWorkloadLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Slider de Retenção Desejada */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Taxa de Retenção Desejada
            </label>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
              {Math.round(retention * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0.75"
            max="0.97"
            step="0.01"
            value={retention}
            onChange={(e) => setRetention(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>75% (Menos revisões)</span>
            <span>90% (Padrão ouro)</span>
            <span>97% (Revisões diárias intensas)</span>
          </div>

          {retention >= 0.95 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>
                Retenções acima de 94% aumentam o volume de repetições exponencialmente. Use para reta final.
              </span>
            </div>
          )}
        </div>

        {/* 3. Limite de Novos Cartões Diários (Seção 29) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Limite Máximo de Novos Cartões / Dia
            </label>
            <input
              type="number"
              min="0"
              max="200"
              value={dailyNewCards}
              onChange={(e) => setDailyNewCards(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
            />
            <span className="text-[11px] text-slate-500 block">
              Recomendado: 15 a 30 cartas/dia para manter equilíbrio.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Intervalo Máximo (Dias)
            </label>
            <input
              type="number"
              min="30"
              max="36500"
              value={maxInterval}
              onChange={(e) => setMaxInterval(parseInt(e.target.value, 10) || 36500)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
            />
            <span className="text-[11px] text-slate-500 block">
              Padrão: 36500 dias (~100 anos).
            </span>
          </div>
        </div>

        {/* 4. Botão de Salvar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Parâmetros FSRS atualizados com sucesso!
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            className="font-bold text-xs"
          >
            Salvar Parâmetros FSRS
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
