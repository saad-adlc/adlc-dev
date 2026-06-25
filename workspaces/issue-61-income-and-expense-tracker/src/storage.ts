import type { Transaction, AllBudgets } from './types';
import { STORAGE_KEY_TRANSACTIONS, STORAGE_KEY_BUDGETS } from './constants';

/** Reads the transaction array from localStorage. Returns [] on failure. */
export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}

/** Writes the transaction array to localStorage. */
export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
}

/** Reads the budgets map from localStorage. Returns {} on failure. */
export function loadBudgets(): AllBudgets {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGETS);
    return raw ? (JSON.parse(raw) as AllBudgets) : {};
  } catch {
    return {};
  }
}

/** Writes the budgets map to localStorage. */
export function saveBudgets(budgets: AllBudgets): void {
  localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
}
