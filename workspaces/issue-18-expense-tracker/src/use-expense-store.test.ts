import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExpenseStore } from './use-expense-store';

beforeEach(() => {
  localStorage.clear();
});

describe('useExpenseStore', () => {
  it('starts with empty expenses and categories', () => {
    const { result } = renderHook(() => useExpenseStore());
    expect(result.current.expenses).toEqual([]);
    expect(result.current.categories).toEqual([]);
  });

  it('adds an expense and persists to localStorage', () => {
    const { result } = renderHook(() => useExpenseStore());
    act(() => {
      result.current.addExpense({ amount: 10, category: 'Food', date: '2024-01-01', notes: '' });
    });
    expect(result.current.expenses).toHaveLength(1);
    expect(result.current.expenses[0].amount).toBe(10);
    expect(localStorage.getItem('et_expenses')).not.toBeNull();
  });

  it('deletes an expense', () => {
    const { result } = renderHook(() => useExpenseStore());
    act(() => {
      result.current.addExpense({ amount: 10, category: 'Food', date: '2024-01-01', notes: '' });
    });
    const id = result.current.expenses[0].id;
    act(() => {
      result.current.deleteExpense(id);
    });
    expect(result.current.expenses).toHaveLength(0);
  });

  it('adds a category', () => {
    const { result } = renderHook(() => useExpenseStore());
    act(() => { result.current.addCategory('Travel'); });
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].name).toBe('Travel');
  });

  it('renames a category', () => {
    const { result } = renderHook(() => useExpenseStore());
    act(() => { result.current.addCategory('Travel'); });
    const id = result.current.categories[0].id;
    act(() => { result.current.renameCategory(id, 'Transport'); });
    expect(result.current.categories[0].name).toBe('Transport');
  });

  it('deletes a category', () => {
    const { result } = renderHook(() => useExpenseStore());
    act(() => { result.current.addCategory('Travel'); });
    const id = result.current.categories[0].id;
    act(() => { result.current.deleteCategory(id); });
    expect(result.current.categories).toHaveLength(0);
  });

  it('filters expenses by category', () => {
    const { result } = renderHook(() => useExpenseStore());
    act(() => {
      result.current.addExpense({ amount: 10, category: 'Food', date: '2024-01-01', notes: '' });
      result.current.addExpense({ amount: 20, category: 'Travel', date: '2024-01-02', notes: '' });
    });
    act(() => { result.current.setFilter('Food'); });
    expect(result.current.filteredExpenses).toHaveLength(1);
    expect(result.current.filteredExpenses[0].category).toBe('Food');
  });

  it('returns all expenses when filter is empty', () => {
    const { result } = renderHook(() => useExpenseStore());
    act(() => {
      result.current.addExpense({ amount: 10, category: 'Food', date: '2024-01-01', notes: '' });
      result.current.addExpense({ amount: 20, category: 'Travel', date: '2024-01-02', notes: '' });
    });
    expect(result.current.filteredExpenses).toHaveLength(2);
  });

  it('loads persisted expenses from localStorage on mount', () => {
    const stored = [{ id: 'abc', amount: 99, category: 'Test', date: '2024-01-01', notes: '' }];
    localStorage.setItem('et_expenses', JSON.stringify(stored));
    const { result } = renderHook(() => useExpenseStore());
    expect(result.current.expenses).toHaveLength(1);
    expect(result.current.expenses[0].amount).toBe(99);
  });
});
