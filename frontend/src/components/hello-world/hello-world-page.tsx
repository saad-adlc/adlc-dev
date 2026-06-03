import { useState } from 'react';
import styles from './hello-world-page.module.css';

/** Maximum number of characters allowed in the name field. */
const MAX_NAME_LENGTH = 50;

/** Regular expression that permits only letters and spaces. */
const VALID_NAME_PATTERN = /^[A-Za-z\s]+$/;

/**
 * Validates the given name string and returns an error message, or null if valid.
 * @param name - Raw value from the name input.
 * @returns A user-facing error string, or null when validation passes.
 */
function validateName(name: string): string | null {
  if (name.trim() === '') {
    return 'Name is required';
  }
  if (!VALID_NAME_PATTERN.test(name)) {
    return 'Name may only contain letters and spaces';
  }
  if (name.length > MAX_NAME_LENGTH) {
    return `Name must be ${MAX_NAME_LENGTH} characters or fewer`;
  }
  return null;
}

/**
 * Standalone page that greets the user by their entered name.
 * Validates for empty input, special characters, and max length.
 */
export function HelloWorldPage() {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Handles form submission: validates input and updates greeting or error state. */
  function handleSubmit() {
    const validationError = validateName(name);
    if (validationError !== null) {
      setError(validationError);
      setGreeting(null);
      return;
    }
    setError(null);
    setGreeting(`Hello, ${name}!`);
  }

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="name-input">
        Your name
      </label>
      <input
        id="name-input"
        className={styles.input}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-describedby={error !== null ? 'name-error' : undefined}
      />
      {error !== null && (
        <span id="name-error" className={styles.error} role="alert">
          {error}
        </span>
      )}
      <button className={styles.button} type="button" onClick={handleSubmit}>
        Say hello
      </button>
      {greeting !== null && <p className={styles.greeting}>{greeting}</p>}
    </div>
  );
}

export default HelloWorldPage;
