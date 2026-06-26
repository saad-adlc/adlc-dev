import { describe, it, expect, beforeEach } from 'vitest';
import { loadTransactions, saveTransactions, loadBudgets, saveBudgets } from './storage';
import { STORAGE_KEY_TRANSACTIONS, STORAGE_KEY_BUDGETS } from './constants';
import type { Transaction } from './types';

const SAMPLE_TX: Transaction = {
  id: 'abc-123',
  amount: 50,
  type: 'expense',
  category: 'Food',
  note: 'Lunch',
  date: '2026-06-01',
};

describe('loadTransactions', () => {
  beforeEach(() => localStorage.clear());

  it('returns empty array when localStorage has no entry', () => {
    expect(loadTransactions()).toEqual([]);
  });

  it('returns parsed array after save', () => {
    saveTransactions([SAMPLE_TX]);
    expect(loadTransactions()).toEqual([SAMPLE_TX]);
  });

  it('returns empty array when stored value is malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, 'not-json{{{');
    expect(loadTransactions()).toEqual([]);
  });
});

describe('saveTransactions', () => {
  beforeEach(() => localStorage.clear());

  it('persists transactions to localStorage', () => {
    saveTransactions([SAMPLE_TX]);
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    expect(JSON.parse(raw!)).toEqual([SAMPLE_TX]);
  });

  it('overwrites previous data', () => {
    saveTransactions([SAMPLE_TX]);
    saveTransactions([]);
    expect(loadTransactions()).toEqual([]);
  });
});

describe('loadBudgets', () => {
  beforeEach(() => localStorage.clear());

  it('returns empty object when localStorage has no entry', () => {
    expect(loadBudgets()).toEqual({});
  });

  it('returns parsed budgets after save', () => {
    const budgets = { '2026-06': { Food: 100, Transport: 50 } };
    saveBudgets(budgets);
    expect(loadBudgets()).toEqual(budgets);
  });

  it('returns empty object when stored value is malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY_BUDGETS, 'bad-json');
    expect(loadBudgets()).toEqual({});
  });
});

describe('saveBudgets', () => {
  beforeEach(() => localStorage.clear());

  it('persists budgets to localStorage', () => {
    const budgets = { '2026-06': { Housing: 1500 } };
    saveBudgets(budgets);
    const raw = localStorage.getItem(STORAGE_KEY_BUDGETS);
    expect(JSON.parse(raw!)).toEqual(budgets);
  });
});
