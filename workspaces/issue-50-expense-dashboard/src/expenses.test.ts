import { describe, it, expect } from 'vitest';
import { categoryTotals, grandTotal, EXPENSES } from './expenses';

describe('grandTotal', () => {
  it('returns $604.84 for the prefilled expenses', () => {
    expect(grandTotal(EXPENSES)).toBeCloseTo(604.84, 2);
  });

  it('returns 0 for empty array', () => {
    expect(grandTotal([])).toBe(0);
  });
});

describe('categoryTotals', () => {
  it('returns correct totals for prefilled expenses', () => {
    const totals = categoryTotals(EXPENSES);
    expect(totals['Bills']).toBeCloseTo(200.00, 2);
    expect(totals['Food']).toBeCloseTo(140.50, 2);
    expect(totals['Shopping']).toBeCloseTo(192.09, 2);
    expect(totals['Transport']).toBeCloseTo(72.25, 2);
  });

  it('returns empty object for empty array', () => {
    expect(categoryTotals([])).toEqual({});
  });

  it('accumulates amounts for repeated categories', () => {
    const data = [
      { date: '2026-01-01', merchant: 'A', category: 'Food', amount: 10 },
      { date: '2026-01-02', merchant: 'B', category: 'Food', amount: 5 },
    ];
    expect(categoryTotals(data)['Food']).toBe(15);
  });
});
