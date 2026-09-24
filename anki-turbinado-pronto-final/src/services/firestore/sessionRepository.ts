import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { StudySession, StudySessionSchema } from '@/types';

function cleanData<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

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
    await setDoc(docRef, cleanData(validated));
    return validated;
  }

  async listRecentSessions(ownerId: string, maxLimit = 20): Promise<StudySession[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => StudySessionSchema.parse(d.data()))
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, maxLimit);
  }

  async getTodayStudiedMinutes(ownerId: string): Promise<number> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startIso = startOfToday.toISOString();

    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    const sessions = snapshot.docs
      .map((d) => StudySessionSchema.parse(d.data()))
      .filter((s) => s.startedAt >= startIso);
    return sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }
}

export const sessionRepository = new SessionRepository();
