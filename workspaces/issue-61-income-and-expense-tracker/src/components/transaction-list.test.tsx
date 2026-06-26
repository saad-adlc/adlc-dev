import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionList from './transaction-list';
import type { Transaction } from '../types';

const tx = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'tx-1',
  amount: 50,
  type: 'expense',
  category: 'Food',
  note: '',
  date: '2026-06-01',
  ...overrides,
});

describe('TransactionList', () => {
  it('renders the section heading with month name', () => {
    render(
      <TransactionList year={2026} month={6} transactions={[]} onDelete={vi.fn()} />,
    );
    expect(screen.getByText(/Transactions.*June 2026/i)).toBeInTheDocument();
  });

  it('shows empty state message when there are no transactions', () => {
    render(
      <TransactionList year={2026} month={6} transactions={[]} onDelete={vi.fn()} />,
    );
    expect(screen.getByText(/no transactions for this month/i)).toBeInTheDocument();
  });

  it('renders one row per transaction', () => {
    const txs = [tx({ id: '1' }), tx({ id: '2', category: 'Transport' })];
    render(
      <TransactionList year={2026} month={6} transactions={txs} onDelete={vi.fn()} />,
    );
    expect(screen.getAllByRole('button', { name: /delete transaction/i })).toHaveLength(2);
  });

  it('shows category name in each row', () => {
    render(
      <TransactionList year={2026} month={6} transactions={[tx()]} onDelete={vi.fn()} />,
    );
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('shows note when present', () => {
    render(
      <TransactionList
        year={2026}
        month={6}
        transactions={[tx({ note: 'Groceries' })]}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('shows signed positive amount for income', () => {
    render(
      <TransactionList
        year={2026}
        month={6}
        transactions={[tx({ type: 'income', amount: 100 })]}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('+$100.00')).toBeInTheDocument();
  });

  it('shows signed negative amount for expense', () => {
    render(
      <TransactionList
        year={2026}
        month={6}
        transactions={[tx({ type: 'expense', amount: 75 })]}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('−$75.00')).toBeInTheDocument();
  });

  it('calls onDelete with the correct id', () => {
    const onDelete = vi.fn();
    render(
      <TransactionList
        year={2026}
        month={6}
        transactions={[tx({ id: 'del-me' })]}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /delete transaction/i }));
    expect(onDelete).toHaveBeenCalledWith('del-me');
  });

  it('does not show empty state when transactions exist', () => {
    render(
      <TransactionList year={2026} month={6} transactions={[tx()]} onDelete={vi.fn()} />,
    );
    expect(screen.queryByText(/no transactions/i)).not.toBeInTheDocument();
  });
});
