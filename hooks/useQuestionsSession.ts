'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { Question, QuestionAttempt, ErrorReason } from '@/types';
import { questionRepository, QuestionFilters } from '@/services/firestore/questionRepository';
import { attemptRepository } from '@/services/firestore/attemptRepository';
import { updateUserProfile } from '@/services/firebase/authService';

export function useQuestionsSession(initialFilters: QuestionFilters = {}) {
  const { user, profile, refreshProfile } = useAuth();

  const [filters, setFilters] = useState<QuestionFilters>(initialFilters);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estado da questão ativa
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<QuestionAttempt | null>(null);

  // Registro de respostas da sessão: questionId -> { selected, isCorrect }
  const [sessionResults, setSessionResults] = useState<
    Map<string, { selectedOptionId: string; isCorrect: boolean }>
  >(new Map());

  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());

  const loadQuestions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await questionRepository.filterQuestions(user.uid, filters, 100);
      setQuestions(data);
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setCurrentAttempt(null);
      setSessionResults(new Map());
      setQuestionStartTime(new Date());
    } catch (err) {
      console.error('Erro ao carregar banco de questões:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const currentQuestion: Question | null = questions[currentIndex] || null;

  // Quando muda de questão, restaura estado se já foi respondida nesta sessão
  useEffect(() => {
    if (!currentQuestion) return;
    const existing = sessionResults.get(currentQuestion.id);
    if (existing) {
      setSelectedOptionId(existing.selectedOptionId);
      setIsAnswered(true);
    } else {
      setSelectedOptionId(null);
      setIsAnswered(false);
      setCurrentAttempt(null);
      setQuestionStartTime(new Date());
    }
  }, [currentIndex, currentQuestion, sessionResults]);

  const submitAnswer = async (
    optionId: string,
    errorReason?: ErrorReason,
    conceptNotes?: string
  ) => {
    if (!user || !currentQuestion || isAnswered) return;

    const timeSpentSeconds = Math.max(
      1,
      Math.round((Date.now() - questionStartTime.getTime()) / 1000)
    );
    const isCorrect = optionId === currentQuestion.correctOptionId;

    const attempt = await attemptRepository.recordAttempt({
      ownerId: user.uid,
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      isCorrect,
      timeSpentSeconds,
      errorDetails: !isCorrect
        ? {
            reason: errorReason || 'confundi_conceitos',
            conceptNotes,
          }
        : undefined,
    });

    setCurrentAttempt(attempt);
    setIsAnswered(true);
    setSelectedOptionId(optionId);

    setSessionResults((prev) => {
      const next = new Map(prev);
      next.set(currentQuestion.id, { selectedOptionId: optionId, isCorrect });
      return next;
    });

    // Concede XP: 15 XP por acerto, 5 XP por tentativa/estudo
    if (profile) {
      const addedXp = isCorrect ? 15 : 5;
      await updateUserProfile(user.uid, {
        xp: profile.xp + addedXp,
      });
      await refreshProfile();
    }
  };

  const toggleFavorite = async () => {
    if (!currentQuestion) return;
    const nextVal = !currentQuestion.isFavorite;
    await questionRepository.toggleFavorite(currentQuestion.id, nextVal);

    setQuestions((prev) =>
      prev.map((q) => (q.id === currentQuestion.id ? { ...q, isFavorite: nextVal } : q))
    );
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  const answeredCount = sessionResults.size;
  const correctCount = Array.from(sessionResults.values()).filter((r) => r.isCorrect).length;

  return {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    selectedOptionId,
    setSelectedOptionId,
    isAnswered,
    currentAttempt,
    loading,
    filters,
    setFilters,
    sessionResults,
    answeredCount,
    correctCount,
    submitAnswer,
    toggleFavorite,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    refresh: loadQuestions,
  };
}
