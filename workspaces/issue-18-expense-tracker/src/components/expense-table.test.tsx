import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseTable from './expense-table';
import type { Expense } from '../types';

const expenses: Expense[] = [
  { id: '1', amount: 10, category: 'Food', date: '2024-01-01', notes: 'Lunch' },
  { id: '2', amount: 20, category: 'Travel', date: '2024-01-02', notes: '' },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('ExpenseTable', () => {
  it('renders empty state when no expenses', () => {
    render(
      <ExpenseTable
        expenses={[]}
        filteredExpenses={[]}
        activeFilter=""
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('No expenses found.')).toBeInTheDocument();
  });

  it('renders expense rows', () => {
    render(
      <ExpenseTable
        expenses={expenses}
        filteredExpenses={expenses}
        activeFilter=""
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('shows running total', () => {
    render(
      <ExpenseTable
        expenses={expenses}
        filteredExpenses={expenses}
        activeFilter=""
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(/Running total:.*\$30\.00/)).toBeInTheDocument();
  });

  it('shows filtered header when filter active', () => {
    render(
      <ExpenseTable
        expenses={expenses}
        filteredExpenses={[expenses[0]]}
        activeFilter="Food"
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Expenses — Food')).toBeInTheDocument();
  });

  it('calls onDelete after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onDelete = vi.fn();
    render(
      <ExpenseTable
        expenses={expenses}
        filteredExpenses={expenses}
        activeFilter=""
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getAllByRole('button', { name: /Delete expense/ })[0]);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('does not call onDelete when confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onDelete = vi.fn();
    render(
      <ExpenseTable
        expenses={expenses}
        filteredExpenses={expenses}
        activeFilter=""
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getAllByRole('button', { name: /Delete expense/ })[0]);
    expect(onDelete).not.toHaveBeenCalled();
  });
});
