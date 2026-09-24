import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Deck, DeckSchema, IDeckRepository } from '@/types';

function cleanData<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

export class DeckRepository implements IDeckRepository {
  private collectionName = 'decks';

  async create(deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> {
    const deckRef = doc(collection(db, this.collectionName));
    const nowIso = new Date().toISOString();

    const newDeck: Deck = {
      ...deckData,
      id: deckRef.id,
      cardCounts: deckData.cardCounts || {
        new: 0,
        learning: 0,
        review: 0,
        relearning: 0,
        total: 0,
      },
      isArchived: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const validated = DeckSchema.parse(newDeck);
    await setDoc(deckRef, cleanData(validated));
    return validated;
  }

  async getById(id: string): Promise<Deck | null> {
    const docRef = doc(db, this.collectionName, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return DeckSchema.parse(snap.data());
  }

  async listByOwner(
    ownerId: string,
    options?: { isArchived?: boolean }
  ): Promise<Deck[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    let decks = snapshot.docs.map((docSnap) => DeckSchema.parse(docSnap.data()));

    const targetArchived = options?.isArchived ?? false;
    decks = decks.filter((d) => (d.isArchived ?? false) === targetArchived);

    decks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return decks;
  }

  async update(id: string, updates: Partial<Deck>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, cleanData({
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async updateCardCounts(
    id: string,
    cardCounts: Deck['cardCounts']
  ): Promise<void> {
    await this.update(id, { cardCounts });
  }
}

export const deckRepository = new DeckRepository();
