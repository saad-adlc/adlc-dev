import { useCallback, useState } from 'react';
import type { Category, Expense } from './types';
import {
  loadCategories,
  loadExpenses,
  saveCategories,
  saveExpenses,
} from './storage';

/** Generates a simple unique id. */
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface ExpenseStore {
  expenses: Expense[];
  categories: Category[];
  activeFilter: string;
  setFilter: (filter: string) => void;
  addExpense: (draft: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  addCategory: (name: string) => void;
  renameCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  filteredExpenses: Expense[];
}

/** Central state hook — loads from localStorage on mount, persists on every change. */
export function useExpenseStore(): ExpenseStore {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [categories, setCategories] = useState<Category[]>(loadCategories);
  const [activeFilter, setActiveFilter] = useState<string>('');

  const setFilter = useCallback((filter: string) => {
    setActiveFilter(filter);
  }, []);

  const addExpense = useCallback((draft: Omit<Expense, 'id'>) => {
    setExpenses((prev) => {
      const next = [...prev, { ...draft, id: uid() }];
      saveExpenses(next);
      return next;
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveExpenses(next);
      return next;
    });
  }, []);

  const addCategory = useCallback((name: string) => {
    setCategories((prev) => {
      const next = [...prev, { id: uid(), name }];
      saveCategories(next);
      return next;
    });
  }, []);

  const renameCategory = useCallback((id: string, name: string) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, name } : c));
      saveCategories(next);
      return next;
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCategories(next);
      return next;
    });
  }, []);

  const filteredExpenses =
    activeFilter === ''
      ? expenses
      : expenses.filter((e) => e.category === activeFilter);

  return {
    expenses,
    categories,
    activeFilter,
    setFilter,
    addExpense,
    deleteExpense,
    addCategory,
    renameCategory,
    deleteCategory,
    filteredExpenses,
  };
}
