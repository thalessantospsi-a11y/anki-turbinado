import { WeakTopicAnalysisInput, WeakTopicVerdict } from './types';

export interface DetectionOptions {
  minQuestionAttempts?: number;
  minCardReviews?: number;
  lowAccuracyThreshold?: number; // Ex: 0.65 (65%)
  highLapseThreshold?: number;    // Ex: 2 lapsos médios
}

export function detectWeakTopics(
  topics: WeakTopicAnalysisInput[],
  options?: DetectionOptions
): WeakTopicVerdict[] {
  const minQuestions = options?.minQuestionAttempts ?? 4;
  const minCards = options?.minCardReviews ?? 5;
  const lowAccuracyThreshold = options?.lowAccuracyThreshold ?? 0.65;
  const highLapseThreshold = options?.highLapseThreshold ?? 1.5;

  const verdicts: WeakTopicVerdict[] = [];

  for (const topic of topics) {
    const hasEnoughData =
      topic.totalQuestions >= minQuestions || topic.totalCards >= minCards;

    // Se a amostra for insuficiente, não rotulamos como fraco
    if (!hasEnoughData) {
      continue;
    }

    const accuracyRate =
      topic.totalQuestions > 0
        ? (topic.totalQuestions - topic.wrongQuestions) / topic.totalQuestions
        : 1;

    const lapseRate = topic.averageLapses;
    const isOverdue = topic.daysSinceLastStudy >= 7;

    let score = 0;
    const reasons: string[] = [];

    // Peso 1: Taxa de acerto em questões (0 a 45 pontos)
    if (topic.totalQuestions >= minQuestions && accuracyRate < lowAccuracyThreshold) {
      const accuracyDeficit = (lowAccuracyThreshold - accuracyRate) / lowAccuracyThreshold;
      score += Math.round(accuracyDeficit * 45);
      reasons.push(
        `Taxa de acerto de ${Math.round(accuracyRate * 100)}% em ${topic.totalQuestions} questões`
      );
    }

    // Peso 2: Lapsos e instabilidade em flashcards FSRS (0 a 35 pontos)
    if (topic.totalCards >= minCards && lapseRate >= highLapseThreshold) {
      score += Math.min(35, Math.round(lapseRate * 12));
      reasons.push(
        `Média de ${lapseRate.toFixed(1)} lapsos por cartão neste assunto`
      );
    }

    // Peso 3: Ausência prolongada de revisões (0 a 20 pontos)
    if (isOverdue) {
      score += Math.min(20, topic.daysSinceLastStudy * 2);
      reasons.push(
        `Sem revisões há ${topic.daysSinceLastStudy} dias`
      );
    }

    const isPriority = score >= 35;

    if (isPriority) {
      verdicts.push({
        disciplina: topic.disciplina,
        assunto: topic.assunto,
        score,
        isPriority: true,
        reason: reasons.join(' • ') || 'Desempenho abaixo da meta estabelecida',
        metrics: {
          accuracyRate: Math.round(accuracyRate * 100),
          lapseRate: Number(lapseRate.toFixed(1)),
          urgencyFactor: score,
        },
      });
    }
  }

  // Ordena pelos assuntos de maior urgência/pontuação
  return verdicts.sort((a, b) => b.score - a.score);
}
