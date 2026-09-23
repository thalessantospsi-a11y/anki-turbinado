import { FSRSCardData, FSRSRating, FSRSParameters } from '@/types';

export interface FSRSNextIntervals {
  again: { intervalDays: number; due: Date };
  hard: { intervalDays: number; due: Date };
  good: { intervalDays: number; due: Date };
  easy: { intervalDays: number; due: Date };
}

export interface FSRSSchedulingResult {
  updatedCard: FSRSCardData;
  scheduledDays: number;
  elapsedDays: number;
  lastElapsedDays: number;
}

export interface IFSRSScheduler {
  previewNextIntervals(cardData: FSRSCardData, params?: FSRSParameters): FSRSNextIntervals;
  applyRating(
    cardData: FSRSCardData,
    rating: FSRSRating,
    reviewTime: Date,
    params?: FSRSParameters
  ): FSRSSchedulingResult;
}
