import { FSRSCardData, FSRSRating, FSRSParameters } from '@/types';
import { fsrsScheduler } from './scheduler';

export interface SimulatedReviewStep {
  step: number;
  rating: FSRSRating;
  ratingLabel: 'Again' | 'Hard' | 'Good' | 'Easy';
  difficulty: number;
  stability: number;
  scheduledDays: number;
  state: number;
  retrievabilityBeforeReview: number;
}

export interface DecayCurvePoint {
  day: number;
  retrievability: number; // 0 a 100%
}

export function calculateFSRSRetrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (19 / 81) * (elapsedDays / stability), -0.5);
}

export function generateDecayCurve(stability: number, totalDays = 30): DecayCurvePoint[] {
  const points: DecayCurvePoint[] = [];
  const safeDays = Math.max(7, totalDays);

  for (let d = 0; d <= safeDays; d++) {
    const r = calculateFSRSRetrievability(d, stability);
    points.push({
      day: d,
      retrievability: Math.round(r * 100),
    });
  }

  return points;
}

export function simulateReviewPath(
  ratings: FSRSRating[],
  initialParams?: FSRSParameters
): SimulatedReviewStep[] {
  let card: FSRSCardData = {
    due: new Date().toISOString(),
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: 0,
  };

  let simulatedTime = new Date();
  const steps: SimulatedReviewStep[] = [];

  ratings.forEach((rating, index) => {
    const rBefore =
      card.stability > 0
        ? calculateFSRSRetrievability(card.scheduledDays, card.stability)
        : 1.0;

    const result = fsrsScheduler.applyRating(card, rating, simulatedTime, initialParams);
    card = result.updatedCard;

    const labels: Record<FSRSRating, 'Again' | 'Hard' | 'Good' | 'Easy'> = {
      1: 'Again',
      2: 'Hard',
      3: 'Good',
      4: 'Easy',
    };

    steps.push({
      step: index + 1,
      rating,
      ratingLabel: labels[rating],
      difficulty: card.difficulty,
      stability: card.stability,
      scheduledDays: card.scheduledDays,
      state: card.state,
      retrievabilityBeforeReview: Math.round(rBefore * 100),
    });

    // Avança o relógio simulado de acordo com os dias agendados
    simulatedTime = new Date(simulatedTime.getTime() + (card.scheduledDays || 1) * 24 * 60 * 60 * 1000);
  });

  return steps;
}
