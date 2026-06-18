import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from './dashboard';
import type { Category, Expense } from '../types';

const categories: Category[] = [{ id: 'c1', name: 'Food' }];
const expenses: Expense[] = [
  { id: '1', amount: 20, category: 'Food', date: '2024-01-01', notes: '' },
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

describe('Dashboard', () => {
  it('renders summary cards', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText('Total spent')).toBeInTheDocument();
  });

  it('renders both chart panels', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText('Spending by category')).toBeInTheDocument();
    expect(screen.getByText('Daily spending')).toBeInTheDocument();
  });

  it('calls onFilterChange when filter is changed', () => {
    const onFilterChange = vi.fn();
    render(<Dashboard {...defaultProps} onFilterChange={onFilterChange} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by category' }), {
      target: { value: 'Food' },
    });
    expect(onFilterChange).toHaveBeenCalledWith('Food');
  });

  it('renders the add expense form', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getAllByText('Add expense').length).toBeGreaterThan(0);
  });
});
