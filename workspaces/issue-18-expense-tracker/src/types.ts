/** Core domain types for the Expense Tracker. */

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface AppState {
  expenses: Expense[];
  categories: Category[];
  activeFilter: string;
}
