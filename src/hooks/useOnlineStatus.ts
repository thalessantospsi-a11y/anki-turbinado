'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPendingSyncItems } from '@/services/offline/indexedDb';
import { offlineSyncService } from '@/services/offline/syncService';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const checkPending = useCallback(async () => {
    try {
      const items = await getPendingSyncItems();
      setPendingCount(items.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    setIsSyncing(true);
    try {
      await offlineSyncService.syncPendingItems();
      await checkPending();
    } catch (err) {
      console.error('Falha ao sincronizar dados offline:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [checkPending]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    checkPending();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Checagem periódica a cada 30 segundos
    const interval = setInterval(() => {
      checkPending();
      if (navigator.onLine) {
        triggerSync();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkPending, triggerSync]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncNow: triggerSync,
  };
}
