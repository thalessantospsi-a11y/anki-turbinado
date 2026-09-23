import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { QuestionAttempt, QuestionAttemptSchema } from '@/types';

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
    await setDoc(docRef, validated);
    return validated;
  }

  async listRecentAttempts(ownerId: string, maxLimit = 50): Promise<QuestionAttempt[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(maxLimit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => QuestionAttemptSchema.parse(d.data()));
  }

  async listWrongAttempts(ownerId: string, maxLimit = 50): Promise<QuestionAttempt[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId),
      where('isCorrect', '==', false),
      orderBy('createdAt', 'desc'),
      firestoreLimit(maxLimit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => QuestionAttemptSchema.parse(d.data()));
  }

  async updateErrorDetails(
    attemptId: string,
    errorDetails: NonNullable<QuestionAttempt['errorDetails']>
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, attemptId);
    await updateDoc(docRef, { errorDetails });
  }

  async getTodayStats(ownerId: string): Promise<{ total: number; correct: number; rate: number }> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startIso = startOfToday.toISOString();

    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId),
      where('createdAt', '>=', startIso)
    );

    const snapshot = await getDocs(q);
    const attempts = snapshot.docs.map((d) => QuestionAttemptSchema.parse(d.data()));
    const total = attempts.length;
    const correct = attempts.filter((a) => a.isCorrect).length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, rate };
  }
}

export const attemptRepository = new AttemptRepository();
