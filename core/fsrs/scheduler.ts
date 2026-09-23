import { FSRSCardData, FSRSRating, FSRSParameters, FSRS_STATES } from '@/types';
import { IFSRSScheduler, FSRSNextIntervals, FSRSSchedulingResult } from './types';

export const DEFAULT_FSRS_WEIGHTS = [
  0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616, 0.1544,
  1.0824, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407, 2.9466, 0.5034, 0.6567,
];

export class FSRSScheduler implements IFSRSScheduler {
  private defaultParams: FSRSParameters = {
    requestRetention: 0.9,
    maximumInterval: 36500,
    w: DEFAULT_FSRS_WEIGHTS,
    enableFuzz: false,
  };

  private getWeights(params?: FSRSParameters): number[] {
    const w = params?.w;
    return w && w.length === 19 ? w : DEFAULT_FSRS_WEIGHTS;
  }

  // Retrievability: R(t, S) = (1 + 19/81 * t/S)^(-0.5)
  private calculateRetrievability(elapsedDays: number, stability: number): number {
    if (stability <= 0) return 0;
    return Math.pow(1 + (19 / 81) * (elapsedDays / stability), -0.5);
  }

  // Intervalo a partir da estabilidade e retenção desejada
  private calculateInterval(stability: number, retention: number, maxInterval: number): number {
    if (stability <= 0) return 1;
    const factor = (81 / 19) * (Math.pow(retention, -2) - 1);
    const interval = Math.round(stability * factor);
    return Math.min(Math.max(1, interval), maxInterval);
  }

  // Dificuldade inicial: D0(G) = w[4] - exp(w[5]*(G-1)) + 1
  private initDifficulty(rating: FSRSRating, w: number[]): number {
    const d = w[4] - Math.exp(w[5] * (rating - 1)) + 1;
    return Math.min(Math.max(1, d), 10);
  }

  // Estabilidade inicial: S0(G) = w[G-1]
  private initStability(rating: FSRSRating, w: number[]): number {
    return Math.max(0.1, w[rating - 1]);
  }

  // Próxima dificuldade
  private nextDifficulty(d: number, rating: FSRSRating, w: number[]): number {
    const nextD = w[7] * this.initDifficulty(3, w) + (1 - w[7]) * (d - w[6] * (rating - 3));
    return Math.min(Math.max(1, nextD), 10);
  }

  // Próxima estabilidade após recall bem-sucedido
  private nextRecallStability(d: number, s: number, r: number, rating: FSRSRating, w: number[]): number {
    const hardPenalty = rating === 2 ? w[15] : 1;
    const easyBonus = rating === 4 ? w[16] : 1;
    const sNew =
      s *
      (1 +
        Math.exp(w[8]) *
          (11 - d) *
          Math.pow(s, -w[9]) *
          (Math.exp((1 - r) * w[10]) - 1) *
          hardPenalty *
          easyBonus);
    return Math.max(0.1, sNew);
  }

  // Próxima estabilidade após esquecimento (Again)
  private nextForgetStability(d: number, s: number, r: number, w: number[]): number {
    const sNew =
      w[11] *
      Math.pow(d, -w[12]) *
      (Math.pow(s + 1, w[13]) - 1) *
      Math.exp((1 - r) * w[14]);
    return Math.min(s, Math.max(0.1, sNew));
  }

  previewNextIntervals(cardData: FSRSCardData, params?: FSRSParameters): FSRSNextIntervals {
    const now = new Date();
    const ratings: FSRSRating[] = [1, 2, 3, 4];
    const results: any = {};

    for (const r of ratings) {
      const scheduled = this.applyRating(cardData, r, now, params);
      const key = r === 1 ? 'again' : r === 2 ? 'hard' : r === 3 ? 'good' : 'easy';
      results[key] = {
        intervalDays: scheduled.scheduledDays,
        due: new Date(scheduled.updatedCard.due),
      };
    }

    return results as FSRSNextIntervals;
  }

  applyRating(
    cardData: FSRSCardData,
    rating: FSRSRating,
    reviewTime: Date,
    params?: FSRSParameters
  ): FSRSSchedulingResult {
    const p = params || this.defaultParams;
    const w = this.getWeights(p);

    const isNew = cardData.state === FSRS_STATES.NEW;
    const lastReviewMs = cardData.lastReview
      ? new Date(cardData.lastReview).getTime()
      : reviewTime.getTime();
    const elapsedDays = Math.max(
      0,
      Math.floor((reviewTime.getTime() - lastReviewMs) / (1000 * 60 * 60 * 24))
    );

    let nextDifficulty = cardData.difficulty;
    let nextStability = cardData.stability;
    let nextState = cardData.state;
    let scheduledDays = 0;
    let lapses = cardData.lapses;

    if (isNew) {
      nextDifficulty = this.initDifficulty(rating, w);
      nextStability = this.initStability(rating, w);

      if (rating === 1) {
        nextState = FSRS_STATES.LEARNING;
        scheduledDays = 0; // 10 minutos
      } else if (rating === 2) {
        nextState = FSRS_STATES.LEARNING;
        scheduledDays = 1;
      } else if (rating === 3) {
        nextState = FSRS_STATES.REVIEW;
        scheduledDays = this.calculateInterval(nextStability, p.requestRetention, p.maximumInterval);
      } else {
        nextState = FSRS_STATES.REVIEW;
        scheduledDays = this.calculateInterval(nextStability * 1.3, p.requestRetention, p.maximumInterval);
      }
    } else {
      const retrievability = this.calculateRetrievability(elapsedDays, cardData.stability);
      nextDifficulty = this.nextDifficulty(cardData.difficulty, rating, w);

      if (rating === 1) {
        lapses += 1;
        nextState = FSRS_STATES.RELEARNING;
        nextStability = this.nextForgetStability(nextDifficulty, cardData.stability, retrievability, w);
        scheduledDays = 0; // 10 minutos
      } else {
        nextState = FSRS_STATES.REVIEW;
        nextStability = this.nextRecallStability(
          nextDifficulty,
          cardData.stability,
          retrievability,
          rating,
          w
        );
        scheduledDays = this.calculateInterval(nextStability, p.requestRetention, p.maximumInterval);
      }
    }

    // Calcula data de vencimento: se scheduledDays === 0, define 10 minutos à frente
    const dueTime = new Date(reviewTime);
    if (scheduledDays === 0) {
      dueTime.setMinutes(dueTime.getMinutes() + 10);
    } else {
      dueTime.setDate(dueTime.getDate() + scheduledDays);
    }

    const updatedCard: FSRSCardData = {
      ...cardData,
      difficulty: Number(nextDifficulty.toFixed(2)),
      stability: Number(nextStability.toFixed(2)),
      elapsedDays,
      scheduledDays,
      reps: cardData.reps + 1,
      lapses,
      state: nextState,
      due: dueTime.toISOString(),
      lastReview: reviewTime.toISOString(),
    };

    return {
      updatedCard,
      scheduledDays,
      elapsedDays,
      lastElapsedDays: cardData.elapsedDays,
    };
  }
}

export const fsrsScheduler = new FSRSScheduler();

export function formatIntervalLabel(intervalDays: number): string {
  if (intervalDays <= 0) return '10m';
  if (intervalDays === 1) return '1d';
  if (intervalDays < 30) return `${intervalDays}d`;
  if (intervalDays < 365) return `${Math.round(intervalDays / 30)}mês`;
  return `${(intervalDays / 365).toFixed(1)}a`;
}
