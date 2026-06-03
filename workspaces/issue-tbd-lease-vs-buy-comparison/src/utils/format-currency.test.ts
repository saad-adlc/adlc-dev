import { describe, it, expect } from 'vitest';
import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  it('formats a whole number correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });

  it('formats a decimal value correctly', () => {
    expect(formatCurrency(608.44)).toBe('$608.44');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats a large number with commas', () => {
    expect(formatCurrency(50000)).toBe('$50,000.00');
  });
});
