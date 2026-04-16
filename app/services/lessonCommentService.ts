import { eq, and } from "drizzle-orm";
import { db } from "~/db";
import { lessonComments, lessonCommentUpvotes, users, UserRole } from "~/db/schema";

// ─── Types ───

export type CommentAuthor = {
  id: number;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
};

export type ReplyRow = {
  id: number;
  lessonId: number;
  userId: number;
  parentCommentId: number;
  content: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
  upvoteCount: number;
  isUpvotedByCurrentInstructor: boolean;
};

export type CommentRow = {
  id: number;
  lessonId: number;
  userId: number;
  parentCommentId: number | null;
  content: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
  upvoteCount: number;
  isUpvotedByCurrentInstructor: boolean;
  replies: ReplyRow[];
};

// ─── Internal helpers ───

function buildCommentTree(
  allComments: (typeof lessonComments.$inferSelect)[],
  userMap: Map<number, CommentAuthor>,
  upvoteCountMap: Map<number, number>,
  instructorUpvotedSet: Set<number>
): CommentRow[] {
  const parents: CommentRow[] = [];
  const replyMap = new Map<number, ReplyRow[]>();

  for (const c of allComments) {
    const author = userMap.get(c.userId) ?? {
      id: c.userId,
      name: "Unknown",
      avatarUrl: null,
      role: UserRole.Student,
    };
    const upvoteCount = upvoteCountMap.get(c.id) ?? 0;
    const isUpvotedByCurrentInstructor = instructorUpvotedSet.has(c.id);

    if (c.parentCommentId === null) {
      parents.push({
        id: c.id,
        lessonId: c.lessonId,
        userId: c.userId,
        parentCommentId: null,
        content: c.content,
        isHidden: c.isHidden,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        author,
        upvoteCount,
        isUpvotedByCurrentInstructor,
        replies: [],
      });
    } else {
      const reply: ReplyRow = {
        id: c.id,
        lessonId: c.lessonId,
        userId: c.userId,
        parentCommentId: c.parentCommentId,
        content: c.content,
        isHidden: c.isHidden,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        author,
        upvoteCount,
        isUpvotedByCurrentInstructor,
      };
      const bucket = replyMap.get(c.parentCommentId) ?? [];
      bucket.push(reply);
      replyMap.set(c.parentCommentId, bucket);
    }
  }

  for (const parent of parents) {
    parent.replies = replyMap.get(parent.id) ?? [];
  }

  return parents;
}

function enrichComments(
  rawComments: (typeof lessonComments.$inferSelect)[],
  currentInstructorId: number | null
): CommentRow[] {
  if (rawComments.length === 0) return [];

  const userIds = [...new Set(rawComments.map((c) => c.userId))];
  const commentIds = rawComments.map((c) => c.id);

  // Fetch all authors in one query
  const allUsers = db.select().from(users).all();
  const userMap = new Map<number, CommentAuthor>(
    allUsers
      .filter((u) => userIds.includes(u.id))
      .map((u) => [
        u.id,
        { id: u.id, name: u.name, avatarUrl: u.avatarUrl, role: u.role as UserRole },
      ])
  );

  // Fetch all upvotes for these comments in one query
  const allUpvotes = db
    .select()
    .from(lessonCommentUpvotes)
    .all()
    .filter((uv) => commentIds.includes(uv.commentId));

  const upvoteCountMap = new Map<number, number>();
  const instructorUpvotedSet = new Set<number>();

  for (const uv of allUpvotes) {
    upvoteCountMap.set(uv.commentId, (upvoteCountMap.get(uv.commentId) ?? 0) + 1);
    if (currentInstructorId !== null && uv.instructorId === currentInstructorId) {
      instructorUpvotedSet.add(uv.commentId);
    }
  }

  return buildCommentTree(rawComments, userMap, upvoteCountMap, instructorUpvotedSet);
}

// ─── Public API ───

export function getCommentById(id: number) {
  return db.select().from(lessonComments).where(eq(lessonComments.id, id)).get();
}

export function addComment(
  lessonId: number,
  userId: number,
  content: string,
  parentCommentId: number | null
) {
  if (parentCommentId !== null) {
    const parent = getCommentById(parentCommentId);
    if (!parent || parent.lessonId !== lessonId) {
      throw new Error("Parent comment not found");
    }
    if (parent.parentCommentId !== null) {
      throw new Error("Cannot reply to a reply");
    }
  }

  return db
    .insert(lessonComments)
    .values({ lessonId, userId, content, parentCommentId })
    .returning()
    .get();
}

export function getCommentsForInstructor(
  lessonId: number,
  currentInstructorId: number
): CommentRow[] {
  const raw = db
    .select()
    .from(lessonComments)
    .where(eq(lessonComments.lessonId, lessonId))
    .all()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return enrichComments(raw, currentInstructorId);
}

export function getCommentsForStudent(
  lessonId: number,
  currentStudentId: number,
  lessonCompleted: boolean
): CommentRow[] {
  const raw = db
    .select()
    .from(lessonComments)
    .where(and(eq(lessonComments.lessonId, lessonId), eq(lessonComments.isHidden, false)))
    .all()
    .filter((c) => lessonCompleted || c.userId === currentStudentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return enrichComments(raw, null);
}

export function toggleHideComment(commentId: number): { isHidden: boolean } {
  const comment = getCommentById(commentId);
  if (!comment) throw new Error("Comment not found");

  const newIsHidden = !comment.isHidden;
  db.update(lessonComments)
    .set({ isHidden: newIsHidden, updatedAt: new Date().toISOString() })
    .where(eq(lessonComments.id, commentId))
    .run();

  return { isHidden: newIsHidden };
}

export function toggleUpvoteComment(
  commentId: number,
  instructorId: number
): { upvoted: boolean; upvoteCount: number } {
  const existing = db
    .select()
    .from(lessonCommentUpvotes)
    .where(
      and(
        eq(lessonCommentUpvotes.commentId, commentId),
        eq(lessonCommentUpvotes.instructorId, instructorId)
      )
    )
    .get();

  if (existing) {
    db.delete(lessonCommentUpvotes).where(eq(lessonCommentUpvotes.id, existing.id)).run();
  } else {
    db.insert(lessonCommentUpvotes).values({ commentId, instructorId }).run();
  }

  const upvoteCount = db
    .select()
    .from(lessonCommentUpvotes)
    .where(eq(lessonCommentUpvotes.commentId, commentId))
    .all().length;

  return { upvoted: !existing, upvoteCount };
}
