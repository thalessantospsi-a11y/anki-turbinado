import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { QuestionAttempt, QuestionAttemptSchema } from '@/types';

function cleanData<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

export class AttemptRepository {
  private collectionName = 'attempts';

  async recordAttempt(
    data: Omit<QuestionAttempt, 'id' | 'createdAt'>
  ): Promise<QuestionAttempt> {
    const docRef = doc(collection(db, this.collectionName));
    const nowIso = new Date().toISOString();

    const newAttempt: QuestionAttempt = {
      ...data,
      id: docRef.id,
      createdAt: nowIso,
    };

    const validated = QuestionAttemptSchema.parse(newAttempt);
    await setDoc(docRef, cleanData(validated));
    return validated;
  }

  async listRecentAttempts(ownerId: string, maxLimit = 50): Promise<QuestionAttempt[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => QuestionAttemptSchema.parse(d.data()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, maxLimit);
  }

  async listWrongAttempts(ownerId: string, maxLimit = 50): Promise<QuestionAttempt[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => QuestionAttemptSchema.parse(d.data()))
      .filter((a) => !a.isCorrect)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, maxLimit);
  }

  async updateErrorDetails(
    attemptId: string,
    errorDetails: NonNullable<QuestionAttempt['errorDetails']>
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, attemptId);
    await updateDoc(docRef, cleanData({ errorDetails }));
  }

  async getTodayStats(ownerId: string): Promise<{ total: number; correct: number; rate: number }> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    const attempts = snapshot.docs
      .map((d) => QuestionAttemptSchema.parse(d.data()))
      .filter((a) => new Date(a.createdAt) >= startOfToday);

    const total = attempts.length;
    const correct = attempts.filter((a) => a.isCorrect).length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, rate };
  }
}

export const attemptRepository = new AttemptRepository();
