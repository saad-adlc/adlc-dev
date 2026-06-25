import { useState, useCallback } from 'react';
import type { Transaction, AllBudgets } from './types';
import { loadTransactions, saveTransactions, loadBudgets, saveBudgets } from './storage';
import { monthKey } from './utils';

/** Computes the new [year, month] pair after navigating prev or next. */
function calcNavigatedMonth(
  year: number,
  month: number,
  direction: 'prev' | 'next',
): [number, number] {
  if (direction === 'prev') {
    return month === 1 ? [year - 1, 12] : [year, month - 1];
  }
  return month === 12 ? [year + 1, 1] : [year, month + 1];
}

/** Provides all app state and mutation callbacks. */
export function useTrackerStore() {
  const today = new Date();
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [budgets, setBudgets] = useState<AllBudgets>(loadBudgets);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: crypto.randomUUID() };
    setTransactions(prev => {
      const updated = [...prev, newTx];
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const setBudget = useCallback(
    (category: string, amount: number) => {
      const key = monthKey(currentYear, currentMonth);
      setBudgets(prev => {
        const monthBudgets = { ...prev[key], [category]: amount };
        const updated = { ...prev, [key]: monthBudgets };
        saveBudgets(updated);
        return updated;
      });
    },
    [currentYear, currentMonth],
  );

  const navigateMonth = useCallback(
    (direction: 'prev' | 'next') => {
      const [y, m] = calcNavigatedMonth(currentYear, currentMonth, direction);
      setCurrentYear(y);
      setCurrentMonth(m);
    },
    [currentYear, currentMonth],
  );

  return {
    transactions,
    budgets,
    currentYear,
    currentMonth,
    addTransaction,
    deleteTransaction,
    setBudget,
    navigateMonth,
  };
}
