import type { Category, Expense } from './types';

const KEYS = {
  EXPENSES: 'et_expenses',
  CATEGORIES: 'et_categories',
} as const;

/** Load expenses from localStorage; returns empty array on parse failure. */
export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(KEYS.EXPENSES);
    return raw ? (JSON.parse(raw) as Expense[]) : [];
  } catch {
    return [];
  }
}

/** Persist expenses to localStorage. */
export function saveExpenses(expenses: Expense[]): void {
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
}

/** Load categories from localStorage; returns empty array on parse failure. */
export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(KEYS.CATEGORIES);
    return raw ? (JSON.parse(raw) as Category[]) : [];
  } catch {
    return [];
  }
}

/** Persist categories to localStorage. */
export function saveCategories(categories: Category[]): void {
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
}
