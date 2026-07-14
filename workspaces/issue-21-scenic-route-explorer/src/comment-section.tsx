import { useState } from 'react';
import { Comment } from './types';
import { getComments, addComment, getUsername } from './storage';
import styles from './comment-section.module.css';

interface CommentSectionProps {
  routeId: string;
}

/** Comment list with an add-comment form. All data persists to localStorage. */
export default function CommentSection({ routeId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(() => getComments(routeId));
  const [text, setText] = useState('');
  const username = getUsername();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const comment = addComment(routeId, trimmed, username);
    setComments(prev => [...prev, comment]);
    setText('');
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Comments</h3>
      {comments.length === 0 && (
        <p className={styles.empty}>No comments yet. Be the first!</p>
      )}
      <ul className={styles.list}>
        {comments.map(comment => (
          <li key={comment.id} className={styles.bubble}>
            <div className={styles.avatar} aria-hidden="true">
              {comment.username.slice(0, 2).toUpperCase()}
            </div>
            <div className={styles.content}>
              <div className={styles.meta}>
                <span className={styles.username}>{comment.username}</span>
                <span className={styles.timestamp}>
                  {new Date(comment.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className={styles.text}>{comment.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a comment..."
          className={styles.input}
          aria-label="Comment text"
        />
        <button type="submit" className={styles.submit}>
          Post
        </button>
      </form>
    </section>
  );
}
