import { Card, Question } from '@/types';
import { WeakTopicVerdict } from '../analytics/types';

export interface DailyStudySessionPlan {
  availableMinutes: number;
  allocatedMinutes: {
    reviews: number;
    questions: number;
    errorReinforcement: number;
    newCards: number;
  };
  cardsToReview: Card[];
  questionsToAnswer: Question[];
  priorityTopics: WeakTopicVerdict[];
  recommendationMessage: string;
}
