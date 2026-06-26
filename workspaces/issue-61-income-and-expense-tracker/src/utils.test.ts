import { describe, it, expect } from 'vitest';
import {
  monthKey,
  filterByMonth,
  totalIncome,
  totalExpenses,
  spentByCategory,
  progressColor,
  formatCurrency,
  monthLabel,
} from './utils';
import type { Transaction } from './types';

const tx = (
  type: 'income' | 'expense',
  amount: number,
  category: string,
  date: string,
): Transaction => ({ id: '1', type, amount, category, note: '', date });

describe('monthKey', () => {
  it('pads single-digit months with a leading zero', () => {
    expect(monthKey(2026, 1)).toBe('2026-01');
    expect(monthKey(2026, 9)).toBe('2026-09');
  });

  it('does not pad two-digit months', () => {
    expect(monthKey(2026, 10)).toBe('2026-10');
    expect(monthKey(2026, 12)).toBe('2026-12');
  });
});

describe('filterByMonth', () => {
  const txs: Transaction[] = [
    tx('income', 100, 'Food', '2026-06-01'),
    tx('expense', 50, 'Food', '2026-06-15'),
    tx('income', 200, 'Food', '2026-07-01'),
  ];

  it('returns only transactions in the selected month', () => {
    expect(filterByMonth(txs, 2026, 6)).toHaveLength(2);
  });

  it('returns empty array when no transactions match', () => {
    expect(filterByMonth(txs, 2026, 5)).toHaveLength(0);
  });
});

describe('totalIncome', () => {
  it('sums only income transactions', () => {
    const txs = [tx('income', 100, 'Food', '2026-06-01'), tx('expense', 30, 'Food', '2026-06-02')];
    expect(totalIncome(txs)).toBe(100);
  });

  it('returns 0 for empty list', () => {
    expect(totalIncome([])).toBe(0);
  });
});

describe('totalExpenses', () => {
  it('sums only expense transactions', () => {
    const txs = [tx('income', 100, 'Food', '2026-06-01'), tx('expense', 30, 'Food', '2026-06-02')];
    expect(totalExpenses(txs)).toBe(30);
  });

  it('returns 0 for empty list', () => {
    expect(totalExpenses([])).toBe(0);
  });
});

describe('spentByCategory', () => {
  it('groups expense amounts by category', () => {
    const txs = [
      tx('expense', 40, 'Food', '2026-06-01'),
      tx('expense', 20, 'Food', '2026-06-02'),
      tx('expense', 60, 'Transport', '2026-06-03'),
      tx('income', 100, 'Food', '2026-06-04'),
    ];
    expect(spentByCategory(txs)).toEqual({ Food: 60, Transport: 60 });
  });

  it('returns empty object for no expenses', () => {
    expect(spentByCategory([tx('income', 100, 'Food', '2026-06-01')])).toEqual({});
  });
});

describe('progressColor', () => {
  it('returns green when budget is zero', () => {
    expect(progressColor(50, 0)).toBe('green');
  });

  it('returns green when below amber threshold', () => {
    expect(progressColor(80, 100)).toBe('green');
  });

  it('returns amber when at or above 85%', () => {
    expect(progressColor(85, 100)).toBe('amber');
    expect(progressColor(99, 100)).toBe('amber');
  });

  it('returns red when at or above 100%', () => {
    expect(progressColor(100, 100)).toBe('red');
    expect(progressColor(150, 100)).toBe('red');
  });
});

describe('formatCurrency', () => {
  it('formats a positive number with $ prefix', () => {
    expect(formatCurrency(12.5)).toBe('$12.50');
  });

  it('formats zero as $0.00', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats a negative number with leading minus', () => {
    expect(formatCurrency(-100)).toBe('-$100.00');
  });
});

describe('monthLabel', () => {
  it('returns "June 2026" for month 6 of 2026', () => {
    expect(monthLabel(2026, 6)).toBe('June 2026');
  });

  it('returns "January 2025" for month 1 of 2025', () => {
    expect(monthLabel(2025, 1)).toBe('January 2025');
  });
});
