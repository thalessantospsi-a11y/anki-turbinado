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
import { Question, QuestionSchema, IQuestionRepository } from '@/types';

export interface QuestionFilters {
  disciplina?: string;
  assunto?: string;
  subassunto?: string;
  banca?: string;
  concurso?: string;
  ano?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  isFavorite?: boolean;
  tag?: string;
}

export class QuestionRepository implements IQuestionRepository {
  private collectionName = 'questions';

  async create(questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> {
    const docRef = doc(collection(db, this.collectionName));
    const nowIso = new Date().toISOString();

    const newQuestion: Question = {
      ...questionData,
      id: docRef.id,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const validated = QuestionSchema.parse(newQuestion);
    await setDoc(docRef, validated);
    return validated;
  }

  async batchCreate(questionsData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Question[]> {
    const batch = writeBatch(db);
    const nowIso = new Date().toISOString();
    const created: Question[] = [];

    for (const qData of questionsData) {
      const docRef = doc(collection(db, this.collectionName));
      const newQ: Question = {
        ...qData,
        id: docRef.id,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      const validated = QuestionSchema.parse(newQ);
      batch.set(docRef, validated);
      created.push(validated);
    }

    await batch.commit();
    return created;
  }

  async getById(id: string): Promise<Question | null> {
    const docRef = doc(db, this.collectionName, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return QuestionSchema.parse(snap.data());
  }

  async filterQuestions(
    ownerId: string,
    filters: QuestionFilters,
    maxLimit = 50
  ): Promise<Question[]> {
    let q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

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
    if (filters.difficulty) {
      q = query(q, where('metadata.difficulty', '==', filters.difficulty));
    }
    if (filters.ano) {
      q = query(q, where('metadata.ano', '==', filters.ano));
    }
    if (filters.isFavorite !== undefined) {
      q = query(q, where('isFavorite', '==', filters.isFavorite));
    }

    q = query(q, orderBy('createdAt', 'desc'), firestoreLimit(maxLimit));

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map((d) => QuestionSchema.parse(d.data()));

    if (filters.tag) {
      results = results.filter((q) => q.metadata.tags.includes(filters.tag!));
    }

    return results;
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      isFavorite,
      updatedAt: new Date().toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}

export const questionRepository = new QuestionRepository();
