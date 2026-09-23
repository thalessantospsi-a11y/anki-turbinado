export interface WeakTopicAnalysisInput {
  disciplina: string;
  assunto: string;
  totalQuestions: number;
  wrongQuestions: number;
  recentErrors: number;
  totalCards: number;
  dueCards: number;
  averageLapses: number;
  averageStability: number;
  daysSinceLastStudy: number;
}

export interface WeakTopicVerdict {
  disciplina: string;
  assunto: string;
  score: number; // 0 a 100 (quanto maior, maior a prioridade de revisão)
  isPriority: boolean;
  reason: string;
  metrics: {
    accuracyRate: number;
    lapseRate: number;
    urgencyFactor: number;
  };
}

export interface FutureLoadProjection {
  dayOffset: number; // 0 = hoje, 1 = amanhã, 3, 7, 14, 30
  dateString: string;
  estimatedDueCards: number;
}
