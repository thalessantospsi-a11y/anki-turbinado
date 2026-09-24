import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Card, CardSchema, ICardRepository } from '@/types';

function cleanData<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

export interface CardFilterOptions {
  disciplina?: string;
  assunto?: string;
  banca?: string;
  concurso?: string;
  tag?: string;
  isSuspended?: boolean;
  isArchived?: boolean;
}

export class CardRepository implements ICardRepository {
  private collectionName = 'cards';

  async create(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    const cardRef = doc(collection(db, this.collectionName));
    const nowIso = new Date().toISOString();

    const newCard: Card = {
      ...cardData,
      id: cardRef.id,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const validated = CardSchema.parse(newCard);
    await setDoc(cardRef, cleanData(validated));
    return validated;
  }

  async batchCreate(cardsData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Card[]> {
    const batch = writeBatch(db);
    const nowIso = new Date().toISOString();
    const createdCards: Card[] = [];

    for (const data of cardsData) {
      const cardRef = doc(collection(db, this.collectionName));
      const card: Card = {
        ...data,
        id: cardRef.id,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      const validated = CardSchema.parse(card);
      batch.set(cardRef, cleanData(validated));
      createdCards.push(validated);
    }

    await batch.commit();
    return createdCards;
  }

  async getById(id: string): Promise<Card | null> {
    const docRef = doc(db, this.collectionName, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return CardSchema.parse(snap.data());
  }

  async listDueCards(ownerId: string, maxItems = 100, deckId?: string): Promise<Card[]> {
    const nowIso = new Date().toISOString();
    let q;

    if (deckId) {
      q = query(
        collection(db, this.collectionName),
        where('deckId', '==', deckId),
        where('metadata.isArchived', '==', false),
        where('metadata.isSuspended', '==', false),
        where('fsrs.due', '<=', nowIso),
        orderBy('fsrs.due', 'asc'),
        firestoreLimit(maxItems)
      );
    } else {
      q = query(
        collection(db, this.collectionName),
        where('ownerId', '==', ownerId),
        where('metadata.isArchived', '==', false),
        where('metadata.isSuspended', '==', false),
        where('fsrs.due', '<=', nowIso),
        orderBy('fsrs.due', 'asc'),
        firestoreLimit(maxItems)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => CardSchema.parse(d.data()));
  }

  async listNewCards(ownerId: string, maxItems = 20, deckId?: string): Promise<Card[]> {
    let q;
    if (deckId) {
      q = query(
        collection(db, this.collectionName),
        where('deckId', '==', deckId),
        where('metadata.isArchived', '==', false),
        where('metadata.isSuspended', '==', false),
        where('fsrs.state', '==', 0),
        orderBy('createdAt', 'asc'),
        firestoreLimit(maxItems)
      );
    } else {
      q = query(
        collection(db, this.collectionName),
        where('ownerId', '==', ownerId),
        where('metadata.isArchived', '==', false),
        where('metadata.isSuspended', '==', false),
        where('fsrs.state', '==', 0),
        orderBy('createdAt', 'asc'),
        firestoreLimit(maxItems)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => CardSchema.parse(d.data()));
  }

  async listByDeck(deckId: string): Promise<Card[]> {
    const q = query(
      collection(db, this.collectionName),
      where('deckId', '==', deckId),
      where('metadata.isArchived', '==', false),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => CardSchema.parse(d.data()));
  }

  async listByFilter(ownerId: string, filters: CardFilterOptions): Promise<Card[]> {
    let q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId),
      where('metadata.isArchived', '==', filters.isArchived ?? false)
    );

    if (filters.isSuspended !== undefined) {
      q = query(q, where('metadata.isSuspended', '==', filters.isSuspended));
    }
    if (filters.disciplina) {
      q = query(q, where('metadata.disciplina', '==', filters.disciplina));
    }
    if (filters.assunto) {
      q = query(q, where('metadata.assunto', '==', filters.assunto));
    }
    if (filters.banca) {
      q = query(q, where('metadata.banca', '==', filters.banca));
    }
    if (filters.concurso) {
      q = query(q, where('metadata.concurso', '==', filters.concurso));
    }

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map((d) => CardSchema.parse(d.data()));

    if (filters.tag) {
      results = results.filter((c) => c.metadata.tags.includes(filters.tag!));
    }

    return results;
  }

  async update(id: string, updates: Partial<Card>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, cleanData({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}

export const cardRepository = new CardRepository();
