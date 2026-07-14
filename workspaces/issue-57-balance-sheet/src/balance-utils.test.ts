import { describe, it, expect } from 'vitest';
import {
  parseAmount,
  isInvalidAmount,
  computeTotal,
  isBalanced,
  formatMoney,
} from './balance-utils';
import type { LineItem } from './balance-types';

const item = (amount: string, id = '1', name = 'Test'): LineItem => ({ id, name, amount });

describe('parseAmount', () => {
  it('returns 0 for blank string', () => expect(parseAmount('')).toBe(0));
  it('returns 0 for whitespace-only', () => expect(parseAmount('   ')).toBe(0));
  it('parses positive integer', () => expect(parseAmount('100')).toBe(100));
  it('parses negative number', () => expect(parseAmount('-50')).toBe(-50));
  it('parses decimal', () => expect(parseAmount('1.25')).toBe(1.25));
  it('returns null for letters', () => expect(parseAmount('abc')).toBeNull());
  it('returns null for mixed text', () => expect(parseAmount('12abc')).toBeNull());
  it('parses zero string', () => expect(parseAmount('0')).toBe(0));
  it('parses large number', () => expect(parseAmount('50000')).toBe(50000));
});

describe('isInvalidAmount', () => {
  it('returns false for blank string', () => expect(isInvalidAmount('')).toBe(false));
  it('returns false for whitespace', () => expect(isInvalidAmount('  ')).toBe(false));
  it('returns false for valid number', () => expect(isInvalidAmount('100')).toBe(false));
  it('returns false for negative', () => expect(isInvalidAmount('-50')).toBe(false));
  it('returns true for letters', () => expect(isInvalidAmount('abc')).toBe(true));
  it('returns true for mixed text', () => expect(isInvalidAmount('12abc')).toBe(true));
});

describe('computeTotal', () => {
  it('returns 0 for empty array', () => expect(computeTotal([])).toBe(0));
  it('sums valid amounts', () => {
    expect(computeTotal([item('100', '1'), item('50', '2')])).toBe(150);
  });
  it('treats blank as 0', () => {
    expect(computeTotal([item('100', '1'), item('', '2')])).toBe(100);
  });
  it('excludes invalid amounts (counts as 0)', () => {
    expect(computeTotal([item('100', '1'), item('abc', '2')])).toBe(100);
  });
  it('includes negative amounts', () => {
    expect(computeTotal([item('100', '1'), item('-30', '2')])).toBe(70);
  });
  it('handles sample Assets dataset', () => {
    const items = [item('12000', 'a1'), item('8000', 'a2'), item('30000', 'a3')];
    expect(computeTotal(items)).toBe(50000);
  });
});

describe('isBalanced', () => {
  it('returns true when equal', () => expect(isBalanced(50000, 50000)).toBe(true));
  it('returns true for sample dataset: 50000 = 26000 + 24000', () =>
    expect(isBalanced(50000, 26000 + 24000)).toBe(true));
  it('returns false when unequal', () => expect(isBalanced(50000, 46000)).toBe(false));
  it('handles cent-level precision (equal)', () =>
    expect(isBalanced(100.005, 100.005)).toBe(true));
  it('returns false when off by one cent', () =>
    expect(isBalanced(100.0, 100.01)).toBe(false));
});

describe('formatMoney', () => {
  it('formats positive integer', () => expect(formatMoney(50000)).toBe('$50,000.00'));
  it('formats zero', () => expect(formatMoney(0)).toBe('$0.00'));
  it('formats decimal', () => expect(formatMoney(1.25)).toBe('$1.25'));
  it('formats negative number with leading minus before $', () =>
    expect(formatMoney(-5000)).toBe('-$5,000.00'));
  it('formats small positive', () => expect(formatMoney(4000)).toBe('$4,000.00'));
});
