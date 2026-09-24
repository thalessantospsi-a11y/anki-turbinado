'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Card, ReviewLog, QuestionAttempt, Question } from '@/types';
import { cardRepository } from '@/services/firestore/cardRepository';
import { reviewLogRepository } from '@/services/firestore/reviewLogRepository';
import { attemptRepository } from '@/services/firestore/attemptRepository';
import { questionRepository } from '@/services/firestore/questionRepository';

export interface SubjectStatItem {
  disciplina: string;
  assunto: string;
  questionsTotal: number;
  questionsCorrect: number;
  accuracyRate: number;
  cardsTotal: number;
  cardsDue: number;
  averageLapses: number;
  averageStability: number;
}

export interface BancaStatItem {
  banca: string;
  questionsTotal: number;
  questionsCorrect: number;
  accuracyRate: number;
  cardsTotal: number;
  isSmallSample: boolean;
}

export function useDetailedStats() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [reviews, setReviews] = useState<ReviewLog[]>([]);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [cardsData, reviewsData, attemptsData, questionsData] = await Promise.all([
        cardRepository.listByFilter(user.uid, { isArchived: false }),
        reviewLogRepository.listRecentReviews(user.uid, 500),
        attemptRepository.listRecentAttempts(user.uid, 500),
        questionRepository.filterQuestions(user.uid, {}, 500),
      ]);

      setCards(cardsData);
      setReviews(reviewsData);
      setAttempts(attemptsData);
      setQuestions(questionsData);
    } catch (err) {
      console.error('Erro ao carregar dados estatísticos:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Estatísticas Globais
  const globalStats = useMemo(() => {
    const totalCards = cards.length;
    let newCards = 0;
    let learningCards = 0;
    let youngCards = 0;
    let matureCards = 0; // Estabilidade >= 21 dias (padrão Anki/FSRS)
    let totalDifficulty = 0;
    let totalStability = 0;
    let totalLapses = 0;

    cards.forEach((c) => {
      totalDifficulty += c.fsrs.difficulty;
      totalStability += c.fsrs.stability;
      totalLapses += c.fsrs.lapses;

      if (c.fsrs.state === 0) newCards++;
      else if (c.fsrs.state === 1 || c.fsrs.state === 3) learningCards++;
      else if (c.fsrs.stability >= 21) matureCards++;
      else youngCards++;
    });

    // Revisões
    const totalReviews = reviews.length;
    let goodAndEasy = 0;
    let totalDurationMs = 0;
    reviews.forEach((r) => {
      if (r.rating === 3 || r.rating === 4) goodAndEasy++;
      totalDurationMs += r.durationMs || 0;
    });

    const retentionRate = totalReviews > 0 ? Math.round((goodAndEasy / totalReviews) * 100) : 100;
    const averageTimePerCard =
      totalReviews > 0 ? Number((totalDurationMs / totalReviews / 1000).toFixed(1)) : 0;

    // Questões
    const totalQuestions = attempts.length;
    const correctQuestions = attempts.filter((a) => a.isCorrect).length;
    const questionAccuracy =
      totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

    return {
      totalCards,
      newCards,
      learningCards,
      youngCards,
      matureCards,
      averageDifficulty: totalCards > 0 ? Number((totalDifficulty / totalCards).toFixed(1)) : 0,
      averageStability: totalCards > 0 ? Number((totalStability / totalCards).toFixed(1)) : 0,
      totalLapses,
      totalReviews,
      retentionRate,
      averageTimePerCard,
      totalQuestions,
      correctQuestions,
      questionAccuracy,
    };
  }, [cards, reviews, attempts]);

  // Estatísticas por Assunto (Disciplina › Assunto)
  const subjectStats = useMemo(() => {
    const map = new Map<string, {
      disciplina: string;
      assunto: string;
      questionsTotal: number;
      questionsCorrect: number;
      cardsTotal: number;
      cardsDue: number;
      totalLapses: number;
      totalStability: number;
    }>();

    // Mapeamento de tentativas a partir do questionMap
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    attempts.forEach((att) => {
      const q = questionMap.get(att.questionId);
      if (!q) return;

      const key = `${q.metadata.disciplina}::${q.metadata.assunto}`;
      const item = map.get(key) || {
        disciplina: q.metadata.disciplina,
        assunto: q.metadata.assunto,
        questionsTotal: 0,
        questionsCorrect: 0,
        cardsTotal: 0,
        cardsDue: 0,
        totalLapses: 0,
        totalStability: 0,
      };

      item.questionsTotal++;
      if (att.isCorrect) item.questionsCorrect++;
      map.set(key, item);
    });

    // Mapeamento dos cartões
    const nowMs = Date.now();
    cards.forEach((c) => {
      const key = `${c.metadata.disciplina}::${c.metadata.assunto}`;
      const item = map.get(key) || {
        disciplina: c.metadata.disciplina,
        assunto: c.metadata.assunto,
        questionsTotal: 0,
        questionsCorrect: 0,
        cardsTotal: 0,
        cardsDue: 0,
        totalLapses: 0,
        totalStability: 0,
      };

      item.cardsTotal++;
      item.totalLapses += c.fsrs.lapses;
      item.totalStability += c.fsrs.stability;
      if (new Date(c.fsrs.due).getTime() <= nowMs) {
        item.cardsDue++;
      }
      map.set(key, item);
    });

    return Array.from(map.values()).map((s) => ({
      disciplina: s.disciplina,
      assunto: s.assunto,
      questionsTotal: s.questionsTotal,
      questionsCorrect: s.questionsCorrect,
      accuracyRate:
        s.questionsTotal > 0 ? Math.round((s.questionsCorrect / s.questionsTotal) * 100) : 0,
      cardsTotal: s.cardsTotal,
      cardsDue: s.cardsDue,
      averageLapses: s.cardsTotal > 0 ? Number((s.totalLapses / s.cardsTotal).toFixed(1)) : 0,
      averageStability:
        s.cardsTotal > 0 ? Number((s.totalStability / s.cardsTotal).toFixed(1)) : 0,
    }));
  }, [cards, attempts, questions]);

  // Estatísticas por Banca Examinadora
  const bancaStats = useMemo(() => {
    const map = new Map<string, {
      banca: string;
      questionsTotal: number;
      questionsCorrect: number;
      cardsTotal: number;
    }>();

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    attempts.forEach((att) => {
      const q = questionMap.get(att.questionId);
      const b = q?.metadata.banca || 'Sem Banca Definida';

      const item = map.get(b) || {
        banca: b,
        questionsTotal: 0,
        questionsCorrect: 0,
        cardsTotal: 0,
      };

      item.questionsTotal++;
      if (att.isCorrect) item.questionsCorrect++;
      map.set(b, item);
    });

    cards.forEach((c) => {
      if (c.metadata.banca) {
        const item = map.get(c.metadata.banca) || {
          banca: c.metadata.banca,
          questionsTotal: 0,
          questionsCorrect: 0,
          cardsTotal: 0,
        };
        item.cardsTotal++;
        map.set(c.metadata.banca, item);
      }
    });

    return Array.from(map.values())
      .map((item) => ({
        banca: item.banca,
        questionsTotal: item.questionsTotal,
        questionsCorrect: item.questionsCorrect,
        accuracyRate:
          item.questionsTotal > 0
            ? Math.round((item.questionsCorrect / item.questionsTotal) * 100)
            : 0,
        cardsTotal: item.cardsTotal,
        isSmallSample: item.questionsTotal < 10,
      }))
      .sort((a, b) => b.questionsTotal - a.questionsTotal);
  }, [cards, attempts, questions]);

  return {
    globalStats,
    subjectStats,
    bancaStats,
    loading,
    refresh: fetchData,
  };
}
