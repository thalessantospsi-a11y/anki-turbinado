'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { cardRepository } from '@/services/firestore/cardRepository';
import { reviewLogRepository } from '@/services/firestore/reviewLogRepository';
import { attemptRepository } from '@/services/firestore/attemptRepository';
import { sessionRepository } from '@/services/firestore/sessionRepository';
import { calculateFutureLoad } from '@/core/analytics/futureLoad';
import { detectWeakTopics } from '@/core/analytics/weakTopics';
import { WeakTopicVerdict, FutureLoadProjection } from '@/core/analytics/types';
import { Card, QuestionAttempt } from '@/types';

export interface DashboardMetrics {
  dueCardsCount: number;
  newCardsCount: number;
  reviewsCompletedToday: number;
  questionsAnsweredToday: number;
  questionsCorrectToday: number;
  accuracyRateToday: number;
  minutesStudiedToday: number;
  streakDays: number;
  weakTopics: WeakTopicVerdict[];
  futureLoad: FutureLoadProjection[];
  recentErrors: QuestionAttempt[];
}

export function useDashboardData() {
  const { user, profile } = useAuth();

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    dueCardsCount: 0,
    newCardsCount: 0,
    reviewsCompletedToday: 0,
    questionsAnsweredToday: 0,
    questionsCorrectToday: 0,
    accuracyRateToday: 0,
    minutesStudiedToday: 0,
    streakDays: 0,
    weakTopics: [],
    futureLoad: [],
    recentErrors: [],
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Cartões devidos e novos
      const [dueCards, newCards, allCards] = await Promise.all([
        cardRepository.listDueCards(user.uid, 200),
        cardRepository.listNewCards(user.uid, profile?.goals.dailyNewCards ?? 20),
        cardRepository.listByFilter(user.uid, { isArchived: false }),
      ]);

      // 2. Estatísticas de hoje
      const [reviewsToday, questionsToday, studiedMinutes, recentErrors] = await Promise.all([
        reviewLogRepository.countReviewsToday(user.uid),
        attemptRepository.getTodayStats(user.uid),
        sessionRepository.getTodayStudiedMinutes(user.uid),
        attemptRepository.listWrongAttempts(user.uid, 5),
      ]);

      // 3. Projeção de carga futura
      const futureLoad = calculateFutureLoad(allCards);

      // 4. Análise de assuntos fracos por disciplina/assunto
      const topicMap = new Map<string, {
        disciplina: string;
        assunto: string;
        totalQuestions: number;
        wrongQuestions: number;
        recentErrors: number;
        totalCards: number;
        dueCards: number;
        totalLapses: number;
        averageStability: number;
        daysSinceLastStudy: number;
      }>();

      for (const card of allCards) {
        const key = `${card.metadata.disciplina}::${card.metadata.assunto}`;
        const existing = topicMap.get(key) || {
          disciplina: card.metadata.disciplina,
          assunto: card.metadata.assunto,
          totalQuestions: 0,
          wrongQuestions: 0,
          recentErrors: 0,
          totalCards: 0,
          dueCards: 0,
          totalLapses: 0,
          averageStability: 0,
          daysSinceLastStudy: 0,
        };

        existing.totalCards += 1;
        existing.totalLapses += card.fsrs.lapses;
        if (new Date(card.fsrs.due).getTime() <= Date.now()) {
          existing.dueCards += 1;
        }

        topicMap.set(key, existing);
      }

      const weakTopicsInput = Array.from(topicMap.values()).map((t) => ({
        disciplina: t.disciplina,
        assunto: t.assunto,
        totalQuestions: t.totalQuestions,
        wrongQuestions: t.wrongQuestions,
        recentErrors: t.recentErrors,
        totalCards: t.totalCards,
        dueCards: t.dueCards,
        averageLapses: t.totalCards > 0 ? t.totalLapses / t.totalCards : 0,
        averageStability: 0,
        daysSinceLastStudy: 0,
      }));

      const weakTopics = detectWeakTopics(weakTopicsInput);

      setMetrics({
        dueCardsCount: dueCards.length,
        newCardsCount: newCards.length,
        reviewsCompletedToday: reviewsToday,
        questionsAnsweredToday: questionsToday.total,
        questionsCorrectToday: questionsToday.correct,
        accuracyRateToday: questionsToday.rate,
        minutesStudiedToday: studiedMinutes,
        streakDays: profile?.streak.current ?? 0,
        weakTopics,
        futureLoad,
        recentErrors,
      });
    } catch (err) {
      console.error('Erro ao carregar métricas da dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { metrics, loading, refresh: loadData };
}
