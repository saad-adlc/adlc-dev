import { describe, it, expect } from 'vitest';
import { buildCategorySlices, buildDailySpend, sumExpenses, topCategory } from './chart-data';
import type { Expense } from './types';

const mkExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: '1',
  amount: 10,
  category: 'Food',
  date: '2024-01-01',
  notes: '',
  ...overrides,
});

describe('buildCategorySlices', () => {
  it('returns empty array for no expenses', () => {
    expect(buildCategorySlices([])).toEqual([]);
  });

  it('computes totals and percentages', () => {
    const expenses = [
      mkExpense({ id: '1', amount: 60, category: 'Food' }),
      mkExpense({ id: '2', amount: 40, category: 'Transport' }),
    ];
    const slices = buildCategorySlices(expenses);
    expect(slices).toHaveLength(2);
    expect(slices[0].category).toBe('Food');
    expect(slices[0].total).toBe(60);
    expect(slices[0].percentage).toBeCloseTo(60);
    expect(slices[1].percentage).toBeCloseTo(40);
  });

  it('sorts by total descending', () => {
    const expenses = [
      mkExpense({ id: '1', amount: 5, category: 'A' }),
      mkExpense({ id: '2', amount: 20, category: 'B' }),
    ];
    const slices = buildCategorySlices(expenses);
    expect(slices[0].category).toBe('B');
  });

  it('aggregates multiple expenses in same category', () => {
    const expenses = [
      mkExpense({ id: '1', amount: 10, category: 'Food' }),
      mkExpense({ id: '2', amount: 20, category: 'Food' }),
    ];
    const slices = buildCategorySlices(expenses);
    expect(slices[0].total).toBe(30);
  });
});

describe('buildDailySpend', () => {
  it('returns empty array for no expenses', () => {
    expect(buildDailySpend([])).toEqual([]);
  });

  it('aggregates by date and sorts ascending', () => {
    const expenses = [
      mkExpense({ id: '1', date: '2024-01-03', amount: 5 }),
      mkExpense({ id: '2', date: '2024-01-01', amount: 10 }),
      mkExpense({ id: '3', date: '2024-01-01', amount: 20 }),
    ];
    const result = buildDailySpend(expenses);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2024-01-01');
    expect(result[0].total).toBe(30);
    expect(result[1].date).toBe('2024-01-03');
  });
});

describe('sumExpenses', () => {
  it('returns 0 for empty array', () => {
    expect(sumExpenses([])).toBe(0);
  });

  it('sums all amounts', () => {
    const expenses = [mkExpense({ id: '1', amount: 10 }), mkExpense({ id: '2', amount: 25.5 })];
    expect(sumExpenses(expenses)).toBe(35.5);
  });
});

describe('topCategory', () => {
  it('returns empty string for no expenses', () => {
    expect(topCategory([])).toBe('');
  });

  it('returns the category with highest spend', () => {
    const expenses = [
      mkExpense({ id: '1', amount: 5, category: 'Food' }),
      mkExpense({ id: '2', amount: 50, category: 'Rent' }),
    ];
    expect(topCategory(expenses)).toBe('Rent');
  });
});
