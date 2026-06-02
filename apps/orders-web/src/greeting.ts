export function greeting(name: string): string {
  return name.trim() ? `Hello, ${name}!` : 'Hello!';
}
