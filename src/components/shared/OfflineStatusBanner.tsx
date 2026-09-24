'use client';

import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineStatusBanner() {
  const { isOnline, pendingCount, isSyncing, syncNow } = useOnlineStatus();

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div className="w-full transition-all duration-300">
      {!isOnline ? (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 font-medium">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>
              <strong>Modo Offline Ativo:</strong> Você pode continuar revisando normalmente. Seus dados estão salvos no aparelho e serão sincronizados assim que a conexão retornar.
            </span>
          </div>
          {pendingCount > 0 && (
            <span className="bg-amber-700 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold">
              {pendingCount} pendente(s)
            </span>
          )}
        </div>
      ) : (
        <div className="bg-blue-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 font-medium">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing
                ? 'Sincronizando revisões salvas offline com o banco na nuvem...'
                : `Conexão restabelecida! Há ${pendingCount} item(ns) aguardando sincronização.`}
            </span>
          </div>
          {!isSyncing && (
            <button
              type="button"
              onClick={syncNow}
              className="bg-white text-blue-700 font-bold px-3 py-1 rounded-lg text-xs hover:bg-blue-50 transition-colors shadow-sm"
            >
              Sincronizar Agora
            </button>
          )}
        </div>
      )}
    </div>
  );
}
