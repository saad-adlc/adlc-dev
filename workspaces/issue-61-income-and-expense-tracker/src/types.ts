/** A single income or expense entry. */
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note: string;
  date: string; // ISO YYYY-MM-DD
}

/** Budget amounts keyed by category name for one month. */
export type MonthBudgets = Record<string, number>;

/** All budgets keyed by "YYYY-MM" month strings. */
export type AllBudgets = Record<string, MonthBudgets>;
