import { formatGreeting, isValidName } from './greeting-utils';

describe('formatGreeting', () => {
  it('formats a plain name', () => {
    expect(formatGreeting('Alice')).toBe('Hello, Alice!');
  });

  it('starts with a capital H', () => {
    expect(formatGreeting('alice')).toBe('Hello, alice!');
  });

  it('trims leading whitespace', () => {
    expect(formatGreeting('  Bob')).toBe('Hello, Bob!');
  });

  it('trims trailing whitespace', () => {
    expect(formatGreeting('Bob  ')).toBe('Hello, Bob!');
  });

  it('preserves internal spaces', () => {
    expect(formatGreeting('Mary Jane')).toBe('Hello, Mary Jane!');
  });
});

describe('isValidName', () => {
  it('returns false for an empty string', () => {
    expect(isValidName('')).toBe(false);
  });

  it('returns false for spaces only', () => {
    expect(isValidName('   ')).toBe(false);
  });

  it('returns false for a tab character', () => {
    expect(isValidName('\t')).toBe(false);
  });

  it('returns true for a plain name', () => {
    expect(isValidName('Alice')).toBe(true);
  });

  it('returns true for a name with surrounding spaces', () => {
    expect(isValidName('  Bob  ')).toBe(true);
  });
});
