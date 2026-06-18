import { useApp } from './app-context';
import { REACTION_EMOJIS } from './types';
import type { ReactionEmoji } from './types';
import styles from './reaction-bar.module.css';

interface ReactionBarProps {
  routeId: string;
}

/** Emoji reaction buttons with live counts for a route. */
export default function ReactionBar({ routeId }: ReactionBarProps) {
  const { getReactions, toggleReaction } = useApp();
  const reactions = getReactions(routeId);

  function handleClick(emoji: ReactionEmoji) {
    toggleReaction(routeId, emoji);
  }

  return (
    <div className={styles.bar} role="group" aria-label="Reactions">
      {REACTION_EMOJIS.map((emoji) => {
        const isActive = reactions.toggled.includes(emoji);
        return (
          <button
            key={emoji}
            onClick={() => handleClick(emoji)}
            className={isActive ? `${styles.btn} ${styles.active}` : styles.btn}
            aria-pressed={isActive}
            aria-label={`React with ${emoji}`}
            type="button"
          >
            <span aria-hidden="true">{emoji}</span>
            <span className={styles.count}>{reactions.counts[emoji]}</span>
          </button>
        );
      })}
    </div>
  );
}
