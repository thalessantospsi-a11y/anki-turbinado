const DB_NAME = 'anki_turbinado_offline_db';
const DB_VERSION = 1;

export interface OfflinePendingItem {
  id: string;
  type: 'review' | 'attempt';
  payload: any;
  createdAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB não suportado no ambiente atual.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pending_sync')) {
        db.createObjectStore('pending_sync', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addPendingSyncItem(item: OfflinePendingItem): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_sync', 'readwrite');
      const store = tx.objectStore('pending_sync');
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Erro ao salvar item pendente offline:', err);
  }
}

export async function getPendingSyncItems(): Promise<OfflinePendingItem[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_sync', 'readonly');
      const store = tx.objectStore('pending_sync');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Erro ao recuperar itens pendentes offline:', err);
    return [];
  }
}

export async function removePendingSyncItem(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_sync', 'readwrite');
      const store = tx.objectStore('pending_sync');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Erro ao remover item sincronizado offline:', err);
  }
}

export async function clearAllPendingSync(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_sync', 'readwrite');
      const store = tx.objectStore('pending_sync');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Erro ao limpar fila de sincronização:', err);
  }
}
