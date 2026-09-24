'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { cardRepository } from '@/services/firestore/cardRepository';
import { reviewLogRepository } from '@/services/firestore/reviewLogRepository';
import { attemptRepository } from '@/services/firestore/attemptRepository';
import {
  DailyTimeDistribution,
  WorkloadForecastReport,
  DayForecast,
  HeatmapDay,
  DailyStudyGoal,
} from '@/types/planner';
import { Card } from '@/types';

export function useStudyPlanner() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [forecastHorizon, setForecastHorizon] = useState<7 | 14 | 30>(14);
  const [availableHours, setAvailableHours] = useState<number>(2); // Default: 2 horas

  // Estatísticas de Hoje
  const [todayReviewsDone, setTodayReviewsDone] = useState(0);
  const [todayQuestionsDone, setTodayQuestionsDone] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Carregar dados principais
  const loadPlannerData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Carregar todos os cards ativos
      const userCards = await cardRepository.listByFilter(user.uid, {
        isArchived: false,
        isSuspended: false,
      });
      setCards(userCards);

      // 2. Carregar progresso de hoje
      const reviewsCount = await reviewLogRepository.countReviewsToday(user.uid);
      setTodayReviewsDone(reviewsCount);

      const qStats = await attemptRepository.getTodayStats(user.uid);
      setTodayQuestionsDone(qStats.total);

      // 3. Carregar logs dos últimos 90 dias para o Heatmap
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const logs = await reviewLogRepository.listReviewsByDateRange(
        user.uid,
        ninetyDaysAgo.toISOString(),
        new Date().toISOString()
      );
      setRecentLogs(logs);
    } catch (err) {
      console.error('Erro ao carregar dados de planejamento:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPlannerData();
  }, [loadPlannerData]);

  // Contagem de cards pendentes hoje e novos
  const dueTodayCount = useMemo(() => {
    const now = new Date();
    return cards.filter((c) => {
      if (c.fsrs.state === 0) return false;
      return new Date(c.fsrs.due) <= now;
    }).length;
  }, [cards]);

  const newCardsCount = useMemo(() => {
    return cards.filter((c) => c.fsrs.state === 0).length;
  }, [cards]);

  // 1. DISTRIBUIÇÃO INTELIGENTE DE TEMPO ("Hoje quero estudar X horas")
  const timeDistribution: DailyTimeDistribution = useMemo(() => {
    const totalMinutes = Math.round(availableHours * 60);

    // Estimativas de tempo médio:
    // Revisão de card: 25 seg (~0.42 min)
    // Nova carta (aprender pela 1ª vez): 60 seg (1 min)
    // Questão com resolução e gabarito: 2.5 min

    // Regra:
    // 1. Revisões têm prioridade absoluta para estancar a curva de esquecimento.
    const neededReviewMinutes = Math.ceil(dueTodayCount * 0.42);
    // Revisão consome até 50% do tempo disponível, ou o que for estritamente necessário
    const reviewMinutes = Math.min(
      totalMinutes,
      Math.max(10, Math.min(neededReviewMinutes, Math.round(totalMinutes * 0.5)))
    );
    const reviewCardsTarget = Math.max(
      1,
      Math.min(dueTodayCount, Math.round(reviewMinutes / 0.42))
    );

    const remainingAfterReviews = Math.max(0, totalMinutes - reviewMinutes);

    // 2. Questões do banco: cerca de 60% do tempo restante
    const questionsMinutes = Math.round(remainingAfterReviews * 0.6);
    const questionsTarget = Math.max(
      5,
      Math.round(questionsMinutes / 2.5)
    );

    // 3. Novas cartas: restante do tempo
    const newCardsMinutes = Math.max(0, remainingAfterReviews - questionsMinutes);
    const newCardsTarget = Math.min(
      newCardsCount,
      Math.max(0, Math.round(newCardsMinutes / 1.0))
    );

    return {
      availableMinutes: totalMinutes,
      reviewMinutes,
      reviewCardsTarget: reviewCardsTarget || 10,
      newCardsMinutes,
      newCardsTarget,
      questionsMinutes,
      questionsTarget: questionsTarget || 10,
    };
  }, [availableHours, dueTodayCount, newCardsCount]);

  // 2. PREVISÃO DE CARGA FUTURA (7, 14 ou 30 dias)
  const workloadForecast: WorkloadForecastReport = useMemo(() => {
    const days: DayForecast[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Criar slots para cada dia
    for (let i = 0; i < forecastHorizon; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + i);

      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dayLabel = `${dayNames[targetDate.getDay()]} ${dd}/${mm}`;

      days.push({
        date: dateStr,
        dayLabel,
        dueCount: 0,
        isOverloaded: false,
      });
    }

    // Alocar cards nos dias respectivos
    cards.forEach((card) => {
      if (card.fsrs.state === 0) return; // cards novos não contam como revisões agendadas

      const dueDate = new Date(card.fsrs.due);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        // Atrasado ou hoje
        if (days[0]) days[0].dueCount += 1;
      } else if (diffDays < forecastHorizon) {
        if (days[diffDays]) days[diffDays].dueCount += 1;
      }
    });

    const OVERLOAD_THRESHOLD = 75; // Limite de sobrecarga recomendável
    let peakDay: DayForecast | null = null;
    const warnings: string[] = [];
    let totalForecasted = 0;

    days.forEach((day, index) => {
      totalForecasted += day.dueCount;
      if (day.dueCount >= OVERLOAD_THRESHOLD) {
        day.isOverloaded = true;
        if (index > 0) {
          warnings.push(
            `Atenção: em ${index} dia(s) (${day.dayLabel}) você terá ${day.dueCount} revisões acumuladas.`
          );
        } else {
          warnings.push(
            `Você tem hoje ${day.dueCount} revisões pendentes! Foque em liquidar essa fila.`
          );
        }
      }

      if (!peakDay || day.dueCount > peakDay.dueCount) {
        peakDay = day;
      }
    });

    // Sugestão de limite de novas cartas para não estourar
    const avgDailyDue = Math.round(totalForecasted / forecastHorizon);
    const recommendedMaxNew = Math.max(5, Math.min(30, Math.round((OVERLOAD_THRESHOLD - avgDailyDue) * 0.35)));

    return {
      days,
      totalForecasted,
      peakDay,
      overloadWarnings: warnings,
      recommendedMaxNewPerDay: recommendedMaxNew,
    };
  }, [cards, forecastHorizon]);

  // 3. HEATMAP DE ESTUDO (Estilo GitHub - últimos 90 dias)
  const heatmapData: HeatmapDay[] = useMemo(() => {
    const map = new Map<string, number>();

    // Inicializar últimos 90 dias com 0
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      map.set(dateStr, 0);
    }

    // Somar revisões registradas nos logs
    recentLogs.forEach((log) => {
      const dateStr = log.reviewTimestamp.split('T')[0];
      if (map.has(dateStr)) {
        map.set(dateStr, (map.get(dateStr) || 0) + 1);
      }
    });

    // Incluir hoje se houver revisões já feitas
    const todayStr = today.toISOString().split('T')[0];
    if (todayReviewsDone > 0) {
      map.set(todayStr, Math.max(map.get(todayStr) || 0, todayReviewsDone));
    }

    return Array.from(map.entries()).map(([date, count]) => {
      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (count > 0 && count <= 5) intensity = 1;
      else if (count > 5 && count <= 15) intensity = 2;
      else if (count > 15 && count <= 35) intensity = 3;
      else if (count > 35) intensity = 4;

      return { date, count, intensity };
    });
  }, [recentLogs, todayReviewsDone]);

  // 4. METAS DIÁRIAS E PROGRESSO
  const studyGoal: DailyStudyGoal = useMemo(() => {
    const targetMinutes = timeDistribution.availableMinutes;
    const targetReviews = timeDistribution.reviewCardsTarget;
    const targetNewCards = timeDistribution.newCardsTarget;
    const targetQuestions = timeDistribution.questionsTarget;

    const completedMinutes = Math.round(
      todayReviewsDone * 0.42 + todayQuestionsDone * 2.5
    );

    return {
      targetMinutes,
      targetReviews,
      targetNewCards,
      targetQuestions,
      completedReviews: todayReviewsDone,
      completedQuestions: todayQuestionsDone,
      completedMinutes,
    };
  }, [timeDistribution, todayReviewsDone, todayQuestionsDone]);

  return {
    loading,
    cardsCount: cards.length,
    dueTodayCount,
    newCardsCount,
    availableHours,
    setAvailableHours,
    forecastHorizon,
    setForecastHorizon,
    timeDistribution,
    workloadForecast,
    heatmapData,
    studyGoal,
    refreshPlanner: loadPlannerData,
  };
}
