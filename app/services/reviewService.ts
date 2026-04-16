import { eq, and, avg, count } from "drizzle-orm";
import { db } from "~/db";
import { courseReviews } from "~/db/schema";

export function getCourseRating(courseId: number): {
  average: number | null;
  count: number;
} {
  const result = db
    .select({ average: avg(courseReviews.rating), count: count() })
    .from(courseReviews)
    .where(eq(courseReviews.courseId, courseId))
    .get();

  const rawAvg = result?.average;
  return {
    average: rawAvg != null ? Math.round(Number(rawAvg) * 10) / 10 : null,
    count: result?.count ?? 0,
  };
}

export function getUserReviewForCourse(userId: number, courseId: number) {
  return db
    .select()
    .from(courseReviews)
    .where(
      and(
        eq(courseReviews.userId, userId),
        eq(courseReviews.courseId, courseId)
      )
    )
    .get();
}

export function upsertReview(
  userId: number,
  courseId: number,
  rating: number
) {
  const existing = getUserReviewForCourse(userId, courseId);

  if (existing) {
    return db
      .update(courseReviews)
      .set({ rating, updatedAt: new Date().toISOString() })
      .where(eq(courseReviews.id, existing.id))
      .returning()
      .get();
  }

  return db
    .insert(courseReviews)
    .values({ userId, courseId, rating })
    .returning()
    .get();
}
