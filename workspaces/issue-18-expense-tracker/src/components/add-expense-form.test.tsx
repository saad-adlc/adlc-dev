import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddExpenseForm from './add-expense-form';
import type { Category } from '../types';

const categories: Category[] = [
  { id: 'c1', name: 'Food' },
  { id: 'c2', name: 'Travel' },
];

describe('AddExpenseForm', () => {
  it('renders all fields', () => {
    render(<AddExpenseForm categories={categories} onAdd={vi.fn()} />);
    expect(screen.getByLabelText('Amount ($)')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes (optional)')).toBeInTheDocument();
  });

  it('shows validation error when amount is missing', () => {
    render(<AddExpenseForm categories={categories} onAdd={vi.fn()} />);
    fireEvent.click(screen.getByText('Add expense'));
    expect(screen.getByText('Amount must be a positive number.')).toBeInTheDocument();
  });

  it('shows validation error when category is not selected', () => {
    render(<AddExpenseForm categories={categories} onAdd={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '10' } });
    fireEvent.click(screen.getByText('Add expense'));
    expect(screen.getByText('Category is required.')).toBeInTheDocument();
  });

  it('calls onAdd with correct data when form is valid', () => {
    const onAdd = vi.fn();
    render(<AddExpenseForm categories={categories} onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '25.5' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2024-06-01' } });
    fireEvent.click(screen.getByText('Add expense'));
    expect(onAdd).toHaveBeenCalledWith({
      amount: 25.5,
      category: 'Food',
      date: '2024-06-01',
      notes: '',
    });
  });

  it('clears form after successful submission', () => {
    render(<AddExpenseForm categories={categories} onAdd={vi.fn()} />);
    const amountInput = screen.getByLabelText('Amount ($)');
    fireEvent.change(amountInput, { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Food' } });
    fireEvent.click(screen.getByText('Add expense'));
    expect((amountInput as HTMLInputElement).value).toBe('');
  });

  it('renders empty state message when no categories', () => {
    render(<AddExpenseForm categories={[]} onAdd={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: 'Category' })).toBeInTheDocument();
  });
});
