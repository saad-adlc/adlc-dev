import { useState } from 'react';
import { ReactionCounts, UserReactions, ReactionEmoji, REACTION_EMOJIS } from './types';
import { toggleReaction, getReactions, getUserReactions } from './storage';
import styles from './reaction-bar.module.css';

interface ReactionBarProps {
  routeId: string;
}

/** Emoji reaction buttons with live counts that persist to localStorage. */
export default function ReactionBar({ routeId }: ReactionBarProps) {
  const [reactions, setReactions] = useState<ReactionCounts>(() => getReactions(routeId));
  const [userReactions, setUserReactions] = useState<UserReactions>(() => getUserReactions(routeId));

  function handleToggle(e: React.MouseEvent, emoji: ReactionEmoji) {
    e.stopPropagation();
    const result = toggleReaction(routeId, emoji);
    setReactions(result.reactions);
    setUserReactions(result.userReactions);
  }

  return (
    <div className={styles.bar}>
      {REACTION_EMOJIS.map(emoji => (
        <button
          key={emoji}
          className={`${styles.btn} ${userReactions[emoji] ? styles.btnActive : ''}`}
          onClick={e => handleToggle(e, emoji)}
          aria-pressed={userReactions[emoji]}
          aria-label={`React with ${emoji}`}
        >
          <span className={styles.emoji}>{emoji}</span>
          <span className={styles.count}>{reactions[emoji]}</span>
        </button>
      ))}
    </div>
  );
}
