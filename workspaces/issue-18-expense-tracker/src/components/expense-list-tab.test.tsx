import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseListTab from './expense-list-tab';
import type { Category, Expense } from '../types';

const categories: Category[] = [{ id: 'c1', name: 'Food' }];
const expenses: Expense[] = [
  { id: '1', amount: 10, category: 'Food', date: '2024-01-01', notes: '' },
];

const defaultProps = {
  expenses,
  categories,
  activeFilter: '',
  filteredExpenses: expenses,
  onAdd: vi.fn(),
  onDelete: vi.fn(),
  onFilterChange: vi.fn(),
  onAddCategory: vi.fn(),
  onRenameCategory: vi.fn(),
  onDeleteCategory: vi.fn(),
};

describe('ExpenseListTab', () => {
  it('renders the add expense form', () => {
    render(<ExpenseListTab {...defaultProps} />);
    expect(screen.getAllByText('Add expense').length).toBeGreaterThan(0);
  });

  it('calls onFilterChange when filter dropdown changes', () => {
    const onFilterChange = vi.fn();
    render(<ExpenseListTab {...defaultProps} onFilterChange={onFilterChange} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by category' }), {
      target: { value: 'Food' },
    });
    expect(onFilterChange).toHaveBeenCalledWith('Food');
  });

  it('renders expense table', () => {
    render(<ExpenseListTab {...defaultProps} />);
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('renders category manager', () => {
    render(<ExpenseListTab {...defaultProps} />);
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });
});
