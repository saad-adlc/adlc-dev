import { describe, it, expect } from 'vitest';
import { composeGreeting } from './greeting';

describe('composeGreeting', () => {
  it('composes a basic greeting', () => {
    expect(composeGreeting('Ada', 'Welcome', false)).toBe('Welcome, Ada!');
  });

  it('uses Hello style by default scenario', () => {
    expect(composeGreeting('World', 'Hello', false)).toBe('Hello, World!');
  });

  it('falls back to World when name is empty', () => {
    expect(composeGreeting('', 'Hello', false)).toBe('Hello, World!');
  });

  it('falls back to World when name is whitespace only', () => {
    expect(composeGreeting('   ', 'Hello', false)).toBe('Hello, World!');
  });

  it('trims leading and trailing spaces from name', () => {
    expect(composeGreeting('  Ada  ', 'Hello', false)).toBe('Hello, Ada!');
  });

  it('uppercases the full greeting when shout is true', () => {
    expect(composeGreeting('Ada', 'Hello', true)).toBe('HELLO, ADA!');
  });

  it('uppercases with fallback name when shout is true', () => {
    expect(composeGreeting('', 'Hello', true)).toBe('HELLO, WORLD!');
  });

  it('handles multi-word style like Hi there', () => {
    expect(composeGreeting('Ada', 'Hi there', false)).toBe('Hi there, Ada!');
  });

  it('handles Good day style', () => {
    expect(composeGreeting('Ada', 'Good day', false)).toBe('Good day, Ada!');
  });
});
