const FALLBACK_NAME = 'World';

/**
 * Composes a greeting string from name, style, and shout toggle.
 * Trims the name; falls back to "World" if empty after trimming.
 */
export function composeGreeting(name: string, style: string, shout: boolean): string {
  const trimmed = name.trim();
  const displayName = trimmed.length === 0 ? FALLBACK_NAME : trimmed;
  const greeting = `${style}, ${displayName}!`;
  return shout ? greeting.toUpperCase() : greeting;
}
