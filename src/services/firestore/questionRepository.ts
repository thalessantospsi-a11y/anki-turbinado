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
import { Question, QuestionSchema, IQuestionRepository } from '@/types';

function cleanData<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

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
    await setDoc(docRef, cleanData(validated));
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
      batch.set(docRef, cleanData(validated));
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
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map((d) => QuestionSchema.parse(d.data()));

    if (filters.disciplina) {
      results = results.filter((q) => q.metadata.disciplina === filters.disciplina);
    }
    if (filters.assunto) {
      results = results.filter((q) => q.metadata.assunto === filters.assunto);
    }
    if (filters.banca) {
      results = results.filter((q) => q.metadata.banca === filters.banca);
    }
    if (filters.concurso) {
      results = results.filter((q) => q.metadata.concurso === filters.concurso);
    }
    if (filters.difficulty) {
      results = results.filter((q) => q.metadata.difficulty === filters.difficulty);
    }
    if (filters.ano) {
      results = results.filter((q) => q.metadata.ano === filters.ano);
    }
    if (filters.isFavorite !== undefined) {
      results = results.filter((q) => q.isFavorite === filters.isFavorite);
    }
    if (filters.tag) {
      results = results.filter((q) => q.metadata.tags.includes(filters.tag!));
    }

    return results
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, maxLimit);
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, cleanData({
      isFavorite,
      updatedAt: new Date().toISOString(),
    }));
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}

export const questionRepository = new QuestionRepository();
