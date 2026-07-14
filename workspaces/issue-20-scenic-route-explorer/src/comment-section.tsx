import { useState } from 'react';
import type { Comment } from './types';
import { useApp } from './app-context';
import styles from './comment-section.module.css';

interface CommentSectionProps {
  routeId: string;
}

/** Format an ISO timestamp to a readable string. */
function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Derive initials from a username for the avatar. */
function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

interface CommentBubbleProps {
  comment: Comment;
}

function CommentBubble({ comment }: CommentBubbleProps) {
  return (
    <div className={styles.bubble}>
      <div className={styles.avatar} aria-hidden="true">
        {getInitials(comment.username)}
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.username}>{comment.username}</span>
          <span className={styles.ts}>{formatTimestamp(comment.timestamp)}</span>
        </div>
        <p className={styles.text}>{comment.text}</p>
      </div>
    </div>
  );
}

/** Comment list with post form for a route. */
export default function CommentSection({ routeId }: CommentSectionProps) {
  const { getComments, addComment } = useApp();
  const [draft, setDraft] = useState('');
  const comments = getComments(routeId);

  function handlePost() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addComment(routeId, trimmed);
    setDraft('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost();
  }

  return (
    <section className={styles.section} aria-label="Comments">
      <h3 className={styles.heading}>Comments ({comments.length})</h3>

      {comments.length === 0 ? (
        <p className={styles.empty}>Be the first to comment!</p>
      ) : (
        <div className={styles.list}>
          {comments.map((c) => (
            <CommentBubble key={c.id} comment={c} />
          ))}
        </div>
      )}

      <div className={styles.form}>
        <textarea
          className={styles.textarea}
          placeholder="Add a comment…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          aria-label="Comment text"
        />
        <button
          type="button"
          className={styles.postBtn}
          onClick={handlePost}
          disabled={!draft.trim()}
        >
          Post
        </button>
      </div>
    </section>
  );
}
