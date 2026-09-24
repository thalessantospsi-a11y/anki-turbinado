'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { updateUserProfile } from '@/services/firebase/authService';
import { reviewLogRepository } from '@/services/firestore/reviewLogRepository';
import { attemptRepository } from '@/services/firestore/attemptRepository';
import { cardRepository } from '@/services/firestore/cardRepository';
import { calculateLevelInfo, XP_REWARDS } from '@/core/gamification/levels';
import { computeBadges, UserGamificationMetrics } from '@/core/gamification/badges';
import { Badge, LevelInfo } from '@/types/gamification';

export function useGamification() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);
  const [correctQuestions, setCorrectQuestions] = useState(0);
  const [examCount, setExamCount] = useState(0);
  const [convertedErrorsCount, setConvertedErrorsCount] = useState(0);

  // Carregar métricas agregadas para cálculo de insígnias e níveis
  const loadMetrics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Contagem de revisões feitas
      const reviews = await reviewLogRepository.listRecentReviews(user.uid, 500);
      setReviewCount(reviews.length);

      // 2. Contagem de questões e simulados
      const attempts = await attemptRepository.listRecentAttempts(user.uid, 500);
      const correct = attempts.filter((a) => a.isCorrect).length;
      const exams = attempts.filter((a) => a.mode === 'mock_exam').length;
      setCorrectQuestions(correct);
      setExamCount(exams > 0 ? Math.ceil(exams / 10) : 0);

      // 3. Contagem de erros convertidos em cartões
      const convertedCards = await cardRepository.listByFilter(user.uid, {
        tag: 'erro-convertido',
      });
      setConvertedErrorsCount(convertedCards.length);
    } catch (err) {
      console.error('Erro ao carregar dados de gamificação:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Informações de Nível do Estudante
  const totalXp = profile?.xp || 0;
  const levelInfo: LevelInfo = useMemo(() => {
    return calculateLevelInfo(totalXp);
  }, [totalXp]);

  // Insígnias / Conquistas calculadas
  const badges: Badge[] = useMemo(() => {
    const metrics: UserGamificationMetrics = {
      reviewCount: Math.max(reviewCount, profile?.xp ? Math.floor(profile.xp / 10) : 0),
      correctQuestions,
      streakBest: profile?.streak?.best || 0,
      streakCurrent: profile?.streak?.current || 0,
      examCount,
      convertedErrorsCount,
    };
    return computeBadges(metrics);
  }, [reviewCount, correctQuestions, profile, examCount, convertedErrorsCount]);

  const unlockedBadgesCount = useMemo(() => {
    return badges.filter((b) => b.unlocked).length;
  }, [badges]);

  // Função para conceder XP e atualizar Firestore
  const grantXp = useCallback(
    async (amount: number, reason?: string) => {
      if (!user || !profile) return;
      const newXp = (profile.xp || 0) + amount;
      const newLevelInfo = calculateLevelInfo(newXp);

      await updateUserProfile(user.uid, {
        xp: newXp,
        level: newLevelInfo.level,
      });

      await refreshProfile();
    },
    [user, profile, refreshProfile]
  );

  return {
    loading,
    totalXp,
    levelInfo,
    streak: profile?.streak || { current: 0, best: 0 },
    badges,
    unlockedBadgesCount,
    totalBadgesCount: badges.length,
    grantXp,
    refreshGamification: loadMetrics,
    XP_REWARDS,
  };
}
