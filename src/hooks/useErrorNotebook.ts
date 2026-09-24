'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { QuestionAttempt, Question, ErrorReason } from '@/types';
import { attemptRepository } from '@/services/firestore/attemptRepository';
import { questionRepository } from '@/services/firestore/questionRepository';

export interface EnrichedErrorEntry {
  attempt: QuestionAttempt;
  question: Question;
  hasGeneratedCard: boolean;
  selectedOptionText: string;
  correctOptionText: string;
}

export function useErrorNotebook() {
  const { user } = useAuth();
  const [errorEntries, setErrorEntries] = useState<EnrichedErrorEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [onlyPendingCards, setOnlyPendingCards] = useState(false);
  const [selectedDisciplina, setSelectedDisciplina] = useState('');
  const [search, setSearch] = useState('');

  const fetchErrors = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const wrongAttempts = await attemptRepository.listWrongAttempts(user.uid, 200);

      // Busca dados completos das questões para cada tentativa
      const uniqueQuestionIds = Array.from(new Set(wrongAttempts.map((a) => a.questionId)));
      const questionMap = new Map<string, Question>();

      await Promise.all(
        uniqueQuestionIds.map(async (qid) => {
          const q = await questionRepository.getById(qid);
          if (q) questionMap.set(q.id, q);
        })
      );

      const enriched: EnrichedErrorEntry[] = [];

      for (const att of wrongAttempts) {
        const question = questionMap.get(att.questionId);
        if (question) {
          const selectedOpt = question.options.find((o) => o.id === att.selectedOptionId);
          const correctOpt = question.options.find((o) => o.id === question.correctOptionId);

          enriched.push({
            attempt: att,
            question,
            hasGeneratedCard: Boolean(att.errorDetails?.generatedCardId),
            selectedOptionText: selectedOpt ? selectedOpt.text : 'Opção não encontrada',
            correctOptionText: correctOpt ? correctOpt.text : 'Gabarito oficial',
          });
        }
      }

      setErrorEntries(enriched);
    } catch (err) {
      console.error('Erro ao carregar caderno de erros:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  const updateErrorReason = async (
    attemptId: string,
    reason: ErrorReason,
    conceptNotes?: string
  ) => {
    await attemptRepository.updateErrorDetails(attemptId, {
      reason,
      conceptNotes,
    });
    setErrorEntries((prev) =>
      prev.map((e) =>
        e.attempt.id === attemptId
          ? {
              ...e,
              attempt: {
                ...e.attempt,
                errorDetails: {
                  ...e.attempt.errorDetails,
                  reason,
                  conceptNotes,
                },
              },
            }
          : e
      )
    );
  };

  // Filtros aplicados
  const filteredEntries = useMemo(() => {
    return errorEntries.filter((entry) => {
      if (onlyPendingCards && entry.hasGeneratedCard) return false;

      if (
        reasonFilter !== 'all' &&
        entry.attempt.errorDetails?.reason !== reasonFilter
      ) {
        return false;
      }

      if (
        selectedDisciplina &&
        entry.question.metadata.disciplina !== selectedDisciplina
      ) {
        return false;
      }

      if (search) {
        const q = search.toLowerCase();
        const matchesStatement = entry.question.statement.toLowerCase().includes(q);
        const matchesSubject = entry.question.metadata.assunto.toLowerCase().includes(q);
        const matchesBanca = entry.question.metadata.banca?.toLowerCase().includes(q);
        if (!matchesStatement && !matchesSubject && !matchesBanca) return false;
      }

      return true;
    });
  }, [errorEntries, reasonFilter, onlyPendingCards, selectedDisciplina, search]);

  // Estatísticas diagnósticas de motivos de erro
  const diagnostics = useMemo(() => {
    const total = errorEntries.length;
    if (total === 0) {
      return {
        totalErrors: 0,
        coverageRate: 0, // % com cartão FSRS
        countsByReason: {} as Record<string, number>,
        topCategory: 'Nenhum erro registrado',
      };
    }

    const counts: Record<string, number> = {};
    let cardsGenerated = 0;

    let conceptualCount = 0;
    let attentionCount = 0;
    let pitfallCount = 0;

    errorEntries.forEach((e) => {
      if (e.hasGeneratedCard) cardsGenerated++;
      const reason = e.attempt.errorDetails?.reason || 'outro';
      counts[reason] = (counts[reason] || 0) + 1;

      if (
        reason === 'nao_sabia' ||
        reason === 'confundi_conceitos' ||
        reason === 'desconhecimento_legislacao' ||
        reason === 'esqueci'
      ) {
        conceptualCount++;
      } else if (reason === 'atencao' || reason === 'interpretacao') {
        attentionCount++;
      } else if (reason === 'pegadinha') {
        pitfallCount++;
      }
    });

    const coverageRate = Math.round((cardsGenerated / total) * 100);

    let topCategory = 'Equilibrado';
    if (conceptualCount >= attentionCount && conceptualCount >= pitfallCount) {
      topCategory = '🧠 Lacuna Conceitual / Memória';
    } else if (attentionCount >= conceptualCount && attentionCount >= pitfallCount) {
      topCategory = '⚡ Atenção e Interpretação Rápida';
    } else if (pitfallCount > 0) {
      topCategory = '⚠️ Pegadinhas de Banca Examinadora';
    }

    return {
      totalErrors: total,
      coverageRate,
      countsByReason: counts,
      topCategory,
      categories: {
        conceptual: conceptualCount,
        attention: attentionCount,
        pitfall: pitfallCount,
      },
    };
  }, [errorEntries]);

  // Lista única de disciplinas dos erros
  const disciplinas = useMemo(() => {
    const set = new Set<string>();
    errorEntries.forEach((e) => {
      if (e.question.metadata.disciplina) set.add(e.question.metadata.disciplina);
    });
    return Array.from(set).sort();
  }, [errorEntries]);

  return {
    entries: filteredEntries,
    rawCount: errorEntries.length,
    loading,
    diagnostics,
    disciplinas,
    reasonFilter,
    setReasonFilter,
    onlyPendingCards,
    setOnlyPendingCards,
    selectedDisciplina,
    setSelectedDisciplina,
    search,
    setSearch,
    updateErrorReason,
    refresh: fetchErrors,
  };
}
