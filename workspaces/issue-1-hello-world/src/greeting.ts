/** Returns a personalised greeting string. */
export function greeting(name: string): string {
  return name.trim() ? `Hello, ${name}!` : 'Hello!';
}
