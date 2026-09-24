'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ReviewLog, Card } from '@/types';
import { reviewLogRepository } from '@/services/firestore/reviewLogRepository';
import { cardRepository } from '@/services/firestore/cardRepository';
import { deckRepository } from '@/services/firestore/deckRepository';

export interface EnrichedReviewLog extends ReviewLog {
  cardFront?: string;
  deckTitle?: string;
  disciplina?: string;
  assunto?: string;
}

export function useReviewHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<EnrichedReviewLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [ratingFilter, setRatingFilter] = useState<number>(0); // 0 = todos
  const [search, setSearch] = useState('');

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rawLogs = await reviewLogRepository.listRecentReviews(user.uid, 250);

      // Carrega metadados de baralhos e cartões associados
      const decks = await deckRepository.listByOwner(user.uid);
      const deckMap = new Map(decks.map((d) => [d.id, d]));

      // Agrupa cartões únicos para consulta otimizada
      const uniqueCardIds = Array.from(new Set(rawLogs.map((l) => l.cardId)));
      const cardMap = new Map<string, Card>();

      await Promise.all(
        uniqueCardIds.slice(0, 100).map(async (cid) => {
          const c = await cardRepository.getById(cid);
          if (c) cardMap.set(c.id, c);
        })
      );

      const enriched: EnrichedReviewLog[] = rawLogs.map((log) => {
        const card = cardMap.get(log.cardId);
        const deck = deckMap.get(log.deckId);

        return {
          ...log,
          cardFront: card?.content.front || `Cartão #${log.cardId.slice(0, 6)}`,
          deckTitle: deck?.title || 'Baralho Geral',
          disciplina: card?.metadata.disciplina || deck?.hierarchy.disciplina,
          assunto: card?.metadata.assunto || deck?.hierarchy.assunto,
        };
      });

      setLogs(enriched);
    } catch (err) {
      console.error('Erro ao carregar histórico de revisões:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filtro por Período
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    return logs.filter((log) => {
      const logTime = new Date(log.reviewTimestamp).getTime();

      if (period === 'today' && logTime < startOfToday) return false;
      if (period === '7days' && logTime < sevenDaysAgo) return false;
      if (period === '30days' && logTime < thirtyDaysAgo) return false;

      if (ratingFilter !== 0 && log.rating !== ratingFilter) return false;

      if (search) {
        const q = search.toLowerCase();
        const matchesFront = log.cardFront?.toLowerCase().includes(q);
        const matchesDeck = log.deckTitle?.toLowerCase().includes(q);
        const matchesDisc = log.disciplina?.toLowerCase().includes(q);
        if (!matchesFront && !matchesDeck && !matchesDisc) return false;
      }

      return true;
    });
  }, [logs, period, ratingFilter, search]);

  // Estatísticas agregadas sobre a amostra filtrada
  const stats = useMemo(() => {
    const total = filteredLogs.length;
    if (total === 0) {
      return {
        totalReviews: 0,
        averageDurationSeconds: 0,
        retentionRate: 100,
        againCount: 0,
        hardCount: 0,
        goodCount: 0,
        easyCount: 0,
      };
    }

    let totalDurationMs = 0;
    let againCount = 0;
    let hardCount = 0;
    let goodCount = 0;
    let easyCount = 0;

    filteredLogs.forEach((log) => {
      totalDurationMs += log.durationMs || 0;
      if (log.rating === 1) againCount++;
      else if (log.rating === 2) hardCount++;
      else if (log.rating === 3) goodCount++;
      else if (log.rating === 4) easyCount++;
    });

    const retentionRate = Math.round(((goodCount + easyCount) / total) * 100);
    const averageDurationSeconds = Number((totalDurationMs / total / 1000).toFixed(1));

    return {
      totalReviews: total,
      averageDurationSeconds,
      retentionRate,
      againCount,
      hardCount,
      goodCount,
      easyCount,
    };
  }, [filteredLogs]);

  return {
    logs: filteredLogs,
    rawLogsCount: logs.length,
    loading,
    stats,
    period,
    setPeriod,
    ratingFilter,
    setRatingFilter,
    search,
    setSearch,
    refresh: fetchHistory,
  };
}
