import { FSRSParameters, FSRSParametersSchema } from '@/types';
import { DEFAULT_FSRS_WEIGHTS } from './scheduler';

export interface FSRSPreset {
  id: 'balanced' | 'high_retention' | 'low_burden';
  name: string;
  description: string;
  requestRetention: number;
  maximumInterval: number;
  estimatedWorkloadLabel: string;
}

export const FSRS_PRESETS: Record<string, FSRSPreset> = {
  balanced: {
    id: 'balanced',
    name: 'Padrão Equilibrado (90%)',
    description: 'Equilíbrio ideal entre carga de revisões diárias e retenção para concursos.',
    requestRetention: 0.90,
    maximumInterval: 36500,
    estimatedWorkloadLabel: 'Carga balanceada (Recomendado)',
  },
  high_retention: {
    id: 'high_retention',
    name: 'Reta Final / Pré-Edital (95%)',
    description: 'Maior taxa de retenção exigindo revisões mais frequentes. Ideal para provas iminentes.',
    requestRetention: 0.95,
    maximumInterval: 180,
    estimatedWorkloadLabel: '~40% mais revisões diárias',
  },
  low_burden: {
    id: 'low_burden',
    name: 'Longo Prazo / Baixa Sobrecarga (85%)',
    description: 'Intervalos mais espaçados para estudantes com pouco tempo disponível por dia.',
    requestRetention: 0.85,
    maximumInterval: 36500,
    estimatedWorkloadLabel: '~30% menos revisões diárias',
  },
};

export function validateFSRSParameters(params: Partial<FSRSParameters>): FSRSParameters {
  const merged: FSRSParameters = {
    requestRetention: params.requestRetention ?? 0.90,
    maximumInterval: params.maximumInterval ?? 36500,
    w: params.w && params.w.length === 19 ? params.w : DEFAULT_FSRS_WEIGHTS,
    enableFuzz: params.enableFuzz ?? false,
  };

  return FSRSParametersSchema.parse(merged);
}

export function estimateWorkloadMultiplier(targetRetention: number): number {
  // Relação aproximada de repetições necessárias em função da retenção: ln(0.9)/ln(R)
  if (targetRetention <= 0.5 || targetRetention >= 1.0) return 1.0;
  return Number((Math.log(0.9) / Math.log(targetRetention)).toFixed(2));
}
