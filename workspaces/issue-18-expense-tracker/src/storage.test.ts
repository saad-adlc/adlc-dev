import { describe, it, expect, beforeEach } from 'vitest';
import { loadExpenses, saveExpenses, loadCategories, saveCategories } from './storage';
import type { Category, Expense } from './types';

beforeEach(() => {
  localStorage.clear();
});

const expense: Expense = { id: '1', amount: 10, category: 'Food', date: '2024-01-01', notes: '' };
const category: Category = { id: 'c1', name: 'Food' };

describe('loadExpenses', () => {
  it('returns empty array when localStorage is empty', () => {
    expect(loadExpenses()).toEqual([]);
  });

  it('returns parsed expenses', () => {
    localStorage.setItem('et_expenses', JSON.stringify([expense]));
    expect(loadExpenses()).toEqual([expense]);
  });

  it('returns empty array on invalid JSON', () => {
    localStorage.setItem('et_expenses', 'not-json');
    expect(loadExpenses()).toEqual([]);
  });
});

describe('saveExpenses', () => {
  it('persists expenses to localStorage', () => {
    saveExpenses([expense]);
    expect(JSON.parse(localStorage.getItem('et_expenses')!)).toEqual([expense]);
  });
});

describe('loadCategories', () => {
  it('returns empty array when localStorage is empty', () => {
    expect(loadCategories()).toEqual([]);
  });

  it('returns parsed categories', () => {
    localStorage.setItem('et_categories', JSON.stringify([category]));
    expect(loadCategories()).toEqual([category]);
  });

  it('returns empty array on invalid JSON', () => {
    localStorage.setItem('et_categories', '{bad}');
    expect(loadCategories()).toEqual([]);
  });
});

describe('saveCategories', () => {
  it('persists categories to localStorage', () => {
    saveCategories([category]);
    expect(JSON.parse(localStorage.getItem('et_categories')!)).toEqual([category]);
  });
});
