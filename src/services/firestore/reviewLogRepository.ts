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
import { ReviewLog, ReviewLogSchema, IReviewLogRepository } from '@/types';

export class ReviewLogRepository implements IReviewLogRepository {
  private collectionName = 'reviews';

  async logReview(logData: Omit<ReviewLog, 'id'>): Promise<ReviewLog> {
    const docRef = doc(collection(db, this.collectionName));
    const newLog: ReviewLog = {
      ...logData,
      id: docRef.id,
    };

    const validated = ReviewLogSchema.parse(newLog);
    await setDoc(docRef, validated);
    return validated;
  }

  async listRecentReviews(ownerId: string, maxLimit = 100): Promise<ReviewLog[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId),
      orderBy('reviewTimestamp', 'desc'),
      firestoreLimit(maxLimit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ReviewLogSchema.parse(d.data()));
  }

  async listReviewsByDateRange(
    ownerId: string,
    startDateIso: string,
    endDateIso: string
  ): Promise<ReviewLog[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId),
      where('reviewTimestamp', '>=', startDateIso),
      where('reviewTimestamp', '<=', endDateIso),
      orderBy('reviewTimestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ReviewLogSchema.parse(d.data()));
  }

  async countReviewsToday(ownerId: string): Promise<number> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startIso = startOfToday.toISOString();

    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId),
      where('reviewTimestamp', '>=', startIso)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  }
}

export const reviewLogRepository = new ReviewLogRepository();
