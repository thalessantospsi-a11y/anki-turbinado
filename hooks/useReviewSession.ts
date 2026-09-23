'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { Card, FSRSRating, ReviewLog } from '@/types';
import { cardRepository } from '@/services/firestore/cardRepository';
import { reviewLogRepository } from '@/services/firestore/reviewLogRepository';
import { deckRepository } from '@/services/firestore/deckRepository';
import { sessionRepository } from '@/services/firestore/sessionRepository';
import { updateUserProfile } from '@/services/firebase/authService';
import { fsrsScheduler, FSRSScheduler } from '@/core/fsrs/scheduler';
import { FSRSNextIntervals } from '@/core/fsrs/types';
import { offlineSyncService } from '@/services/offline/syncService';

export interface ReviewSessionOptions {
  deckId?: string;
  mode?: 'normal' | 'new' | 'cram' | 'difficult';
  tag?: string;
}

export function useReviewSession(options: ReviewSessionOptions = {}) {
  const { user, profile, refreshProfile } = useAuth();
  const [cardsQueue, setCardsQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStartTime] = useState<Date>(new Date());
  const [cardStartTime, setCardStartTime] = useState<Date>(new Date());
  const [isFinished, setIsFinished] = useState(false);

  const [ratingsCount, setRatingsCount] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const loadCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      let cards: Card[] = [];

      if (options.mode === 'new') {
        cards = await cardRepository.listNewCards(user.uid, 20, options.deckId);
      } else {
        cards = await cardRepository.listDueCards(user.uid, 100, options.deckId);
      }

      if (options.tag) {
        cards = cards.filter((c) => c.metadata.tags.includes(options.tag!));
      }

      setCardsQueue(cards);
      setCurrentIndex(0);
      setIsAnswerRevealed(false);
      setCardStartTime(new Date());
    } catch (err) {
      console.error('Erro ao carregar fila de revisão:', err);
    } finally {
      setLoading(false);
    }
  }, [user, options.deckId, options.mode, options.tag]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const currentCard = useMemo(() => {
    return cardsQueue[currentIndex] || null;
  }, [cardsQueue, currentIndex]);

  const nextIntervals: FSRSNextIntervals | null = useMemo(() => {
    if (!currentCard) return null;
    return fsrsScheduler.previewNextIntervals(currentCard.fsrs);
  }, [currentCard]);

  const revealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  const gradeCard = async (rating: FSRSRating) => {
    if (!currentCard || !user) return;

    const now = new Date();
    const durationMs = now.getTime() - cardStartTime.getTime();

    // 1. Calcula a transição de estado via FSRS
    const { updatedCard, scheduledDays, elapsedDays, lastElapsedDays } =
      fsrsScheduler.repeat(currentCard.fsrs, rating, now);

    const logData = {
      ownerId: user.uid,
      cardId: currentCard.id,
      deckId: currentCard.deckId,
      rating,
      state: updatedCard.state,
      scheduledDays,
      elapsedDays,
      lastElapsedDays,
      reviewTimestamp: now.toISOString(),
      durationMs,
    };

    // 2. Grava ou enfileira offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await offlineSyncService.queueReview(
        currentCard.id,
        { fsrs: updatedCard },
        logData
      );
    } else {
      try {
        await cardRepository.update(currentCard.id, {
          fsrs: updatedCard,
        });
        await reviewLogRepository.logReview(logData);
      } catch (netErr) {
        console.warn('Falha de conexão com Firestore, enfileirando offline:', netErr);
        await offlineSyncService.queueReview(
          currentCard.id,
          { fsrs: updatedCard },
          logData
        );
      }
    }

    // 4. Atualiza contadores locais da sessão
    setRatingsCount((prev) => {
      if (rating === 1) return { ...prev, again: prev.again + 1 };
      if (rating === 2) return { ...prev, hard: prev.hard + 1 };
      if (rating === 3) return { ...prev, good: prev.good + 1 };
      return { ...prev, easy: prev.easy + 1 };
    });

    // 5. Se o rating for 'Again' (1), reinsere o cartão no final da fila da sessão atual
    if (rating === 1) {
      setCardsQueue((prev) => [...prev, { ...currentCard, fsrs: updatedCard }]);
    }

    // 6. Avança para o próximo cartão
    const nextIndex = currentIndex + 1;
    if (nextIndex >= cardsQueue.length && rating !== 1) {
      await finalizeSession();
    } else {
      setCurrentIndex(nextIndex);
      setIsAnswerRevealed(false);
      setCardStartTime(new Date());
    }
  };

  const suspendCurrentCard = async () => {
    if (!currentCard) return;
    await cardRepository.update(currentCard.id, {
      metadata: { ...currentCard.metadata, isSuspended: true },
    });
    const nextIndex = currentIndex + 1;
    if (nextIndex >= cardsQueue.length) {
      await finalizeSession();
    } else {
      setCurrentIndex(nextIndex);
      setIsAnswerRevealed(false);
      setCardStartTime(new Date());
    }
  };

  const finalizeSession = async () => {
    if (!user) return;
    setIsFinished(true);

    const now = new Date();
    const durationMinutes = Math.max(
      1,
      Math.round((now.getTime() - sessionStartTime.getTime()) / (1000 * 60))
    );
    const totalReviewed =
      ratingsCount.again + ratingsCount.hard + ratingsCount.good + ratingsCount.easy;

    try {
      await sessionRepository.createSession({
        ownerId: user.uid,
        startedAt: sessionStartTime.toISOString(),
        endedAt: now.toISOString(),
        durationMinutes,
        cardsReviewed: totalReviewed,
        questionsAnswered: 0,
        questionsCorrect: 0,
        topicsCovered: Array.from(new Set(cardsQueue.map((c) => c.metadata.disciplina))),
      });
    } catch (e) {
      console.warn('Erro ao registrar sessão finalizada (offline?):', e);
    }

    // Atualiza XP e Streak do perfil
    if (profile) {
      const addedXp = totalReviewed * 10;
      const todayStr = new Date().toISOString().split('T')[0];
      const isNewDay = profile.streak.lastActiveDate !== todayStr;
      const newStreak = isNewDay ? profile.streak.current + 1 : profile.streak.current;

      try {
        await updateUserProfile(user.uid, {
          xp: profile.xp + addedXp,
          streak: {
            current: newStreak,
            best: Math.max(profile.streak.best, newStreak),
            lastActiveDate: todayStr,
          },
        });
        await refreshProfile();
      } catch (e) {
        console.warn('Erro ao atualizar perfil online:', e);
      }
    }
  };

  return {
    currentCard,
    currentIndex,
    totalCards: cardsQueue.length,
    isAnswerRevealed,
    loading,
    isFinished,
    ratingsCount,
    nextIntervals,
    revealAnswer,
    gradeCard,
    suspendCurrentCard,
    restartSession: loadCards,
  };
}
