import { Card } from '@/types';
import { FutureLoadProjection } from './types';

export function calculateFutureLoad(
  cards: Card[],
  baseDate: Date = new Date()
): FutureLoadProjection[] {
  const dayBuckets = [
    { offset: 0, label: 'Hoje' },
    { offset: 1, label: 'Amanhã' },
    { offset: 3, label: 'Em 3 dias' },
    { offset: 7, label: 'Em 7 dias' },
    { offset: 14, label: 'Em 14 dias' },
    { offset: 30, label: 'Em 30 dias' },
  ];

  const nowMs = baseDate.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  return dayBuckets.map((bucket) => {
    const targetDate = new Date(nowMs + bucket.offset * oneDayMs);
    const targetDateStr = targetDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });

    // Conta cartões com vencimento até a data limite do offset
    const estimatedDueCards = cards.filter((card) => {
      if (card.metadata.isArchived || card.metadata.isSuspended) return false;
      const cardDueMs = new Date(card.fsrs.due).getTime();
      return cardDueMs <= targetDate.getTime();
    }).length;

    return {
      dayOffset: bucket.offset,
      dateString: `${bucket.label} (${targetDateStr})`,
      estimatedDueCards,
    };
  });
}
