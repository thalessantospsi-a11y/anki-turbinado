'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { Question, MockExamConfig } from '@/types';
import { questionRepository } from '@/services/firestore/questionRepository';
import { attemptRepository } from '@/services/firestore/attemptRepository';
import { sessionRepository } from '@/services/firestore/sessionRepository';
import { updateUserProfile } from '@/services/firebase/authService';

export interface ExamResultsData {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  scorePercentage: number;
  timeSpentMinutes: number;
  disciplines: { disciplina: string; total: number; correct: number; pct: number }[];
  difficulties: { difficulty: string; total: number; correct: number; pct: number }[];
  wrongQuestions: { question: Question; selectedOptionId: string }[];
}

export function useMockExam(config: MockExamConfig | null) {
  const { user, profile, refreshProfile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Respostas e Marcações
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  // Cronômetro
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(
    (config?.timeLimitMinutes || 60) * 60
  );
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<ExamResultsData | null>(null);
  const [startTime] = useState<Date>(new Date());

  // Carrega as questões para o simulado
  useEffect(() => {
    if (!user || !config) return;
    setLoading(true);

    questionRepository
      .filterQuestions(user.uid, {
        disciplina: config.filters.disciplinas?.[0],
        banca: config.filters.bancas?.[0],
        difficulty: config.filters.difficulties?.[0],
      }, config.totalQuestions * 2)
      .then((pool) => {
        // Embaralha e corta na quantidade desejada
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, config.totalQuestions));
        setTimeRemainingSeconds(config.timeLimitMinutes * 60);
      })
      .finally(() => setLoading(false));
  }, [user, config]);

  // Contagem regressiva do cronômetro
  useEffect(() => {
    if (isFinished || loading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, loading, questions.length]);

  const selectOption = (optionId: string) => {
    if (isFinished || !questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(qId, optionId);
      return next;
    });
  };

  const toggleFlag = () => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleFinishExam = async () => {
    if (!user || isFinished) return;
    setIsFinished(true);

    const timeSpentMinutes = Math.max(
      1,
      Math.round(((config?.timeLimitMinutes || 60) * 60 - timeRemainingSeconds) / 60)
    );

    let correctCount = 0;
    const wrongQuestions: { question: Question; selectedOptionId: string }[] = [];
    const discMap = new Map<string, { total: number; correct: number }>();
    const diffMap = new Map<string, { total: number; correct: number }>();

    for (const q of questions) {
      const selected = answers.get(q.id);
      const isCorrect = selected === q.correctOptionId;

      if (isCorrect) correctCount++;
      else if (selected) {
        wrongQuestions.push({ question: q, selectedOptionId: selected });
      }

      // Desempenho por disciplina
      const d = q.metadata.disciplina || 'Geral';
      const curD = discMap.get(d) || { total: 0, correct: 0 };
      curD.total++;
      if (isCorrect) curD.correct++;
      discMap.set(d, curD);

      // Desempenho por dificuldade
      const diff = q.metadata.difficulty || 'medium';
      const curDiff = diffMap.get(diff) || { total: 0, correct: 0 };
      curDiff.total++;
      if (isCorrect) curDiff.correct++;
      diffMap.set(diff, curDiff);

      // Grava tentativa no banco para histórico e caderno de erros
      if (selected) {
        await attemptRepository.recordAttempt({
          ownerId: user.uid,
          questionId: q.id,
          selectedOptionId: selected,
          isCorrect,
          timeSpentSeconds: Math.round((timeSpentMinutes * 60) / questions.length),
          errorDetails: !isCorrect ? { reason: 'confundi_conceitos' } : undefined,
        });
      }
    }

    const totalQuestions = questions.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const disciplines = Array.from(discMap.entries()).map(([disciplina, val]) => ({
      disciplina,
      total: val.total,
      correct: val.correct,
      pct: Math.round((val.correct / val.total) * 100),
    }));

    const difficulties = Array.from(diffMap.entries()).map(([difficulty, val]) => ({
      difficulty,
      total: val.total,
      correct: val.correct,
      pct: Math.round((val.correct / val.total) * 100),
    }));

    const examResults: ExamResultsData = {
      totalQuestions,
      answeredCount: answers.size,
      correctCount,
      wrongCount: totalQuestions - correctCount,
      scorePercentage,
      timeSpentMinutes,
      disciplines,
      difficulties,
      wrongQuestions,
    };

    setResults(examResults);

    // Registra sessão de estudo
    await sessionRepository.createSession({
      ownerId: user.uid,
      startedAt: startTime.toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes: timeSpentMinutes,
      cardsReviewed: 0,
      questionsAnswered: answers.size,
      questionsCorrect: correctCount,
      topicsCovered: disciplines.map((d) => d.disciplina),
    });

    // Concede XP: 25 XP por acerto em simulado + 50 XP bônus de prova
    if (profile) {
      await updateUserProfile(user.uid, {
        xp: profile.xp + correctCount * 25 + 50,
      });
      await refreshProfile();
    }
  };

  const currentQuestion = questions[currentIndex] || null;

  return {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    selectedOptionId: currentQuestion ? answers.get(currentQuestion.id) || null : null,
    isFlagged: currentQuestion ? flagged.has(currentQuestion.id) : false,
    answers,
    flagged,
    timeRemainingSeconds,
    isFinished,
    results,
    loading,
    selectOption,
    toggleFlag,
    setCurrentIndex,
    finishExam: handleFinishExam,
  };
}
