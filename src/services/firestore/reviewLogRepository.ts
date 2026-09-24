import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ReviewLog, ReviewLogSchema, IReviewLogRepository } from '@/types';

function cleanData<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

export class ReviewLogRepository implements IReviewLogRepository {
  private collectionName = 'reviews';

  async logReview(logData: Omit<ReviewLog, 'id'>): Promise<ReviewLog> {
    const docRef = doc(collection(db, this.collectionName));
    const newLog: ReviewLog = {
      ...logData,
      id: docRef.id,
    };

    const validated = ReviewLogSchema.parse(newLog);
    await setDoc(docRef, cleanData(validated));
    return validated;
  }

  async listRecentReviews(ownerId: string, maxLimit = 100): Promise<ReviewLog[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ReviewLogSchema.parse(d.data()))
      .sort((a, b) => new Date(b.reviewTimestamp).getTime() - new Date(a.reviewTimestamp).getTime())
      .slice(0, maxLimit);
  }

  async listReviewsByDateRange(
    ownerId: string,
    startDateIso: string,
    endDateIso: string
  ): Promise<ReviewLog[]> {
    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ReviewLogSchema.parse(d.data()))
      .filter((d) => d.reviewTimestamp >= startDateIso && d.reviewTimestamp <= endDateIso)
      .sort((a, b) => new Date(a.reviewTimestamp).getTime() - new Date(b.reviewTimestamp).getTime());
  }

  async countReviewsToday(ownerId: string): Promise<number> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startIso = startOfToday.toISOString();

    const q = query(
      collection(db, this.collectionName),
      where('ownerId', '==', ownerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ReviewLogSchema.parse(d.data()))
      .filter((d) => d.reviewTimestamp >= startIso).length;
  }
}

export const reviewLogRepository = new ReviewLogRepository();
