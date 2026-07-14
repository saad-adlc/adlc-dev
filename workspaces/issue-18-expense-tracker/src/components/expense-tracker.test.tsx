import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseTracker from './expense-tracker';

beforeEach(() => {
  localStorage.clear();
});

describe('ExpenseTracker', () => {
  it('renders app title', () => {
    render(<ExpenseTracker />);
    expect(screen.getByText('Expense Tracker')).toBeInTheDocument();
  });

  it('shows Dashboard tab by default', () => {
    render(<ExpenseTracker />);
    expect(screen.getByText('Spending by category')).toBeInTheDocument();
  });

  it('switches to Expense List tab', () => {
    render(<ExpenseTracker />);
    fireEvent.click(screen.getByRole('button', { name: 'Expense List' }));
    expect(screen.queryByText('Spending by category')).toBeNull();
  });

  it('can add a category and use it in the expense form', () => {
    render(<ExpenseTracker />);
    const input = screen.getByPlaceholderText('New category name…');
    fireEvent.change(input, { target: { value: 'Groceries' } });
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getAllByText('Groceries').length).toBeGreaterThan(0);
  });

  it('shows empty state for expenses on first load', () => {
    render(<ExpenseTracker />);
    expect(screen.getByText('No expenses found.')).toBeInTheDocument();
  });
});
