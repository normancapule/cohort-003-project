import { useState, useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { Eye, EyeOff, MessageSquare, ThumbsUp } from "lucide-react";
import { UserRole } from "~/db/schema";
import type { CommentRow, ReplyRow, CommentAuthor } from "~/services/lessonCommentService";
import { UserAvatar } from "~/components/user-avatar";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

// ─── Types ───

type LessonCommentsProps = {
  comments: CommentRow[];
  currentUserId: number;
  currentUserRole: UserRole;
  lessonId: number;
  lessonCompleted: boolean;
  enrolled: boolean;
};

type ActionData = {
  success?: boolean;
  intent?: string;
  errors?: Record<string, string>;
  isHidden?: boolean;
  upvoted?: boolean;
  upvoteCount?: number;
};

// ─── Comment Form ───

function CommentForm({
  lessonId,
  parentCommentId,
  onSuccess,
  autoFocus,
}: {
  lessonId: number;
  parentCommentId?: number;
  onSuccess?: () => void;
  autoFocus?: boolean;
}) {
  const fetcher = useFetcher<ActionData>();
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmitting = fetcher.state !== "idle";

  // Reset and notify on success
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.intent === "add-comment") {
      setContent("");
      onSuccess?.();
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  const contentError = fetcher.data?.errors?.content;

  return (
    <fetcher.Form method="post" className="space-y-2">
      <input type="hidden" name="intent" value="add-comment" />
      {parentCommentId !== undefined && (
        <input type="hidden" name="parentCommentId" value={String(parentCommentId)} />
      )}
      <Textarea
        ref={textareaRef}
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentCommentId !== undefined ? "Write a reply…" : "Ask a question or share a thought…"}
        rows={3}
        maxLength={2000}
        className="resize-none text-sm"
        disabled={isSubmitting}
      />
      <div className="flex items-center justify-between">
        <span className={cn("text-xs text-muted-foreground", content.length > 1900 && "text-amber-500")}>
          {content.length}/2000
        </span>
        <div className="flex items-center gap-2">
          {contentError && (
            <span className="text-xs text-destructive">{contentError}</span>
          )}
          <Button type="submit" size="sm" disabled={isSubmitting || content.trim().length === 0}>
            {isSubmitting ? "Posting…" : parentCommentId !== undefined ? "Reply" : "Post"}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}

// ─── Comment Card ───

function CommentCard({
  comment,
  currentUserId,
  currentUserRole,
  lessonId,
  isReply = false,
}: {
  comment: CommentRow | ReplyRow;
  currentUserId: number;
  currentUserRole: UserRole;
  lessonId: number;
  isReply?: boolean;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const hideFetcher = useFetcher<ActionData>({ key: `hide-${comment.id}` });
  const upvoteFetcher = useFetcher<ActionData>({ key: `upvote-${comment.id}` });

  const isInstructor =
    currentUserRole === UserRole.Instructor || currentUserRole === UserRole.Admin;

  // Optimistic hide state
  const optimisticIsHidden = hideFetcher.formData
    ? hideFetcher.formData.get("intent") === "hide-comment"
      ? !comment.isHidden
      : comment.isHidden
    : (hideFetcher.data?.isHidden !== undefined ? hideFetcher.data.isHidden : comment.isHidden);

  // Optimistic upvote state
  const optimisticUpvoted = upvoteFetcher.formData
    ? !comment.isUpvotedByCurrentInstructor
    : (upvoteFetcher.data?.upvoted !== undefined ? upvoteFetcher.data.upvoted : comment.isUpvotedByCurrentInstructor);
  const optimisticUpvoteCount = upvoteFetcher.formData
    ? comment.isUpvotedByCurrentInstructor
      ? comment.upvoteCount - 1
      : comment.upvoteCount + 1
    : (upvoteFetcher.data?.upvoteCount !== undefined ? upvoteFetcher.data.upvoteCount : comment.upvoteCount);

  const formattedDate = new Date(comment.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const isAuthorInstructor =
    comment.author.role === UserRole.Instructor || comment.author.role === UserRole.Admin;

  return (
    <div className={cn("space-y-3", isReply && "pl-10 border-l border-border")}>
      <div
        className={cn(
          "rounded-lg border border-border bg-card p-4 space-y-2",
          optimisticIsHidden && (isInstructor || comment.userId === currentUserId) && "opacity-60"
        )}
      >
        {/* Author row */}
        <div className="flex items-center gap-2">
          <UserAvatar name={comment.author.name} avatarUrl={comment.author.avatarUrl} className="size-7" />
          <span className="text-sm font-medium">{comment.author.name}</span>
          {isAuthorInstructor && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Instructor
            </span>
          )}
          {optimisticIsHidden && (isInstructor || comment.userId === currentUserId) && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <EyeOff className="size-3" />
              {comment.userId === currentUserId ? "Hidden by you" : "Hidden from students"}
            </span>
          )}
          <span className="ml-auto text-xs text-muted-foreground">{formattedDate}</span>
        </div>

        {/* Content */}
        {optimisticIsHidden ? (
          <p className="text-sm italic text-muted-foreground">
            {comment.userId === currentUserId ? "Hidden by you" : "Hidden comment"}
          </p>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
        )}

        {/* Action row */}
        <div className="flex items-center gap-1 pt-1">
          {/* Upvote — instructors only, visible comments only */}
          {isInstructor && !optimisticIsHidden && (
            <upvoteFetcher.Form method="post">
              <input type="hidden" name="intent" value="upvote-comment" />
              <input type="hidden" name="commentId" value={String(comment.id)} />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 gap-1.5 px-2 text-xs",
                  optimisticUpvoted && "text-primary"
                )}
              >
                <ThumbsUp className={cn("size-3.5", optimisticUpvoted && "fill-current")} />
                {optimisticUpvoteCount > 0 && optimisticUpvoteCount}
              </Button>
            </upvoteFetcher.Form>
          )}

          {/* Hide/Unhide — instructors or comment owner */}
          {(isInstructor || comment.userId === currentUserId) && (
            <hideFetcher.Form method="post">
              <input type="hidden" name="intent" value="hide-comment" />
              <input type="hidden" name="commentId" value={String(comment.id)} />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {optimisticIsHidden ? (
                  <><Eye className="size-3.5" /> Unhide</>
                ) : (
                  <><EyeOff className="size-3.5" /> Hide</>
                )}
              </Button>
            </hideFetcher.Form>
          )}

          {/* Reply — visible comments only, top-level only */}
          {!isReply && !optimisticIsHidden && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowReplyForm((v) => !v)}
            >
              <MessageSquare className="size-3.5" />
              {showReplyForm ? "Cancel" : "Reply"}
            </Button>
          )}
        </div>
      </div>

      {/* Inline reply form */}
      {showReplyForm && !isReply && (
        <div className="pl-10">
          <CommentForm
            lessonId={lessonId}
            parentCommentId={comment.id}
            autoFocus
            onSuccess={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Replies — only on top-level CommentRow */}
      {"replies" in comment && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              lessonId={lessonId}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ───

export function LessonComments({
  comments,
  currentUserId,
  currentUserRole,
  lessonId,
  lessonCompleted,
  enrolled,
}: LessonCommentsProps) {
  const isInstructor =
    currentUserRole === UserRole.Instructor || currentUserRole === UserRole.Admin;
  const isStudent = currentUserRole === UserRole.Student;

  const totalCount = comments.reduce(
    (acc, c) => acc + 1 + ("replies" in c ? c.replies.length : 0),
    0
  );

  return (
    <section className="mt-12 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">Discussion</h2>
        {totalCount > 0 && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm text-muted-foreground">
            {totalCount}
          </span>
        )}
      </div>

      {/* Visibility notice for students who haven't completed the lesson */}
      {isStudent && !lessonCompleted && (
        <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Complete this lesson to see comments from other students.
        </div>
      )}

      {/* New comment form */}
      {(enrolled || isInstructor) && (
        <CommentForm lessonId={lessonId} />
      )}

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              lessonId={lessonId}
            />
          ))}
        </div>
      ) : (
        (enrolled || isInstructor) && lessonCompleted && (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to ask a question.
          </p>
        )
      )}
    </section>
  );
}
