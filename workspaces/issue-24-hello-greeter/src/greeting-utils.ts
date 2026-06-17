/** The localStorage key used to persist greetings. */
export const STORAGE_KEY = 'hello-greeter-greetings';

/**
 * Formats a name into a greeting string.
 * Leading/trailing whitespace is trimmed.
 */
export function formatGreeting(name: string): string {
  return `Hello, ${name.trim()}!`;
}

/** Returns true when the name is non-empty after trimming. */
export function isValidName(name: string): boolean {
  return name.trim().length > 0;
}
