import {
  getPendingSyncItems,
  removePendingSyncItem,
  addPendingSyncItem,
  OfflinePendingItem,
} from './indexedDb';
import { reviewLogRepository } from '@/services/firestore/reviewLogRepository';
import { attemptRepository } from '@/services/firestore/attemptRepository';
import { cardRepository } from '@/services/firestore/cardRepository';

class OfflineSyncService {
  private isSyncing = false;

  async queueReview(cardId: string, cardUpdates: any, logData: any): Promise<void> {
    const item: OfflinePendingItem = {
      id: `review_${cardId}_${Date.now()}`,
      type: 'review',
      payload: { cardId, cardUpdates, logData },
      createdAt: new Date().toISOString(),
    };
    await addPendingSyncItem(item);
  }

  async queueAttempt(attemptData: any): Promise<void> {
    const item: OfflinePendingItem = {
      id: `attempt_${attemptData.questionId}_${Date.now()}`,
      type: 'attempt',
      payload: attemptData,
      createdAt: new Date().toISOString(),
    };
    await addPendingSyncItem(item);
  }

  async syncPendingItems(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;

    try {
      const items = await getPendingSyncItems();
      if (items.length === 0) {
        this.isSyncing = false;
        return { synced: 0, failed: 0 };
      }

      for (const item of items) {
        try {
          if (item.type === 'review') {
            const { cardId, cardUpdates, logData } = item.payload;
            await cardRepository.update(cardId, cardUpdates);
            await reviewLogRepository.logReview(logData);
            await removePendingSyncItem(item.id);
            synced++;
          } else if (item.type === 'attempt') {
            await attemptRepository.recordAttempt(item.payload);
            await removePendingSyncItem(item.id);
            synced++;
          }
        } catch (itemErr) {
          console.error(`Falha ao sincronizar item offline ${item.id}:`, itemErr);
          failed++;
        }
      }
    } catch (err) {
      console.error('Erro no ciclo de sincronização offline:', err);
    } finally {
      this.isSyncing = false;
    }

    return { synced, failed };
  }
}

export const offlineSyncService = new OfflineSyncService();
