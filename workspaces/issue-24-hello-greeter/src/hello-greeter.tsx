import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useGreetings } from './use-greetings';
import { formatGreeting, isValidName } from './greeting-utils';
import styles from './hello-greeter.module.css';

/** Single-page greeting list with localStorage persistence. */
export default function HelloGreeter() {
  const [input, setInput] = useState('');
  const { greetings, addGreeting, removeGreeting, clearAll } = useGreetings();

  const canAdd = isValidName(input);

  function handleAdd(): void {
    if (!canAdd) return;
    addGreeting(input);
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>Hello Greeter</h1>

        <div className={styles.inputSection}>
          <label htmlFor="name-input" className={styles.label}>
            Add a name
          </label>
          <div className={styles.inputRow}>
            <input
              id="name-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a name"
              className={styles.input}
            />
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className={styles.addButton}
              aria-label="Add"
            >
              +
            </button>
          </div>
        </div>

        {greetings.length > 0 ? (
          <>
            <div className={styles.listHeader}>
              <span className={styles.count}>Greetings · {greetings.length}</span>
              <button
                onClick={clearAll}
                className={styles.clearButton}
                aria-label="Clear all"
              >
                🗑
              </button>
            </div>
            <ul className={styles.list}>
              {greetings.map(g => (
                <li key={g.id} className={styles.row}>
                  <span>{formatGreeting(g.name)}</span>
                  <button
                    onClick={() => removeGreeting(g.id)}
                    className={styles.removeButton}
                    aria-label={`Remove ${g.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.emptyState}>
            No greetings yet — add a name above.
          </p>
        )}
      </div>
    </main>
  );
}
