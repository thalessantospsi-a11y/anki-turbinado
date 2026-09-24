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
    const now = new Date();
    const q = deckId
      ? query(collection(db, this.collectionName), where('deckId', '==', deckId))
      : query(collection(db, this.collectionName), where('ownerId', '==', ownerId));

    const snapshot = await getDocs(q);
    const allCards = snapshot.docs.map((d) => CardSchema.parse(d.data()));

    return allCards
      .filter((c) => {
        if (c.metadata.isArchived || c.metadata.isSuspended) return false;
        return new Date(c.fsrs.due) <= now;
      })
      .sort((a, b) => new Date(a.fsrs.due).getTime() - new Date(b.fsrs.due).getTime())
      .slice(0, maxItems);
  }

  async listNewCards(ownerId: string, maxItems = 20, deckId?: string): Promise<Card[]> {
    const q = deckId
      ? query(collection(db, this.collectionName), where('deckId', '==', deckId))
      : query(collection(db, this.collectionName), where('ownerId', '==', ownerId));

    const snapshot = await getDocs(q);
    const allCards = snapshot.docs.map((d) => CardSchema.parse(d.data()));

    return allCards
      .filter((c) => {
        if (c.metadata.isArchived || c.metadata.isSuspended) return false;
        return c.fsrs.state === 0;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, maxItems);
  }

  async listByDeck(deckId: string): Promise<Card[]> {
    const q = query(
      collection(db, this.collectionName),
      where('deckId', '==', deckId)
    );
    const snapshot = await getDocs(q);
    const allCards = snapshot.docs.map((d) => CardSchema.parse(d.data()));

    return allCards
      .filter((c) => !c.metadata.isArchived)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listByFilter(ownerId: string, filters: CardFilterOptions): Promise<Card[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map((d) => CardSchema.parse(d.data()));

    if (filters.isArchived !== undefined) {
      results = results.filter((c) => (c.metadata.isArchived ?? false) === filters.isArchived);
    } else {
      results = results.filter((c) => !c.metadata.isArchived);
    }

    if (filters.isSuspended !== undefined) {
      results = results.filter((c) => c.metadata.isSuspended === filters.isSuspended);
    }
    if (filters.disciplina) {
      results = results.filter((c) => c.metadata.disciplina === filters.disciplina);
    }
    if (filters.assunto) {
      results = results.filter((c) => c.metadata.assunto === filters.assunto);
    }
    if (filters.banca) {
      results = results.filter((c) => c.metadata.banca === filters.banca);
    }
    if (filters.concurso) {
      results = results.filter((c) => c.metadata.concurso === filters.concurso);
    }
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
    }));
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}

export const cardRepository = new CardRepository();
