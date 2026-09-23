import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { StudySession, StudySessionSchema } from '@/types';

export class SessionRepository {
  private collectionName = 'studySessions';

  async createSession(
    data: Omit<StudySession, 'id'>
  ): Promise<StudySession> {
    const docRef = doc(collection(db, this.collectionName));
    const newSession: StudySession = {
      ...data,
      id: docRef.id,
    };

    const validated = StudySessionSchema.parse(newSession);
    await setDoc(docRef, validated);
    return validated;
  }

  async listRecentSessions(ownerId: string, maxLimit = 20): Promise<StudySession[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId),
      orderBy('startedAt', 'desc'),
      firestoreLimit(maxLimit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => StudySessionSchema.parse(d.data()));
  }

  async getTodayStudiedMinutes(ownerId: string): Promise<number> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startIso = startOfToday.toISOString();

    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId),
      where('startedAt', '>=', startIso)
    );

    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map((d) => StudySessionSchema.parse(d.data()));
    return sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }
}

export const sessionRepository = new SessionRepository();
