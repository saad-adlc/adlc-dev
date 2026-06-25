import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddTransactionForm from './add-transaction-form';

const CATEGORIES = ['Food', 'Transport', 'Other'] as const;
const TODAY = new Date().toISOString().slice(0, 10);

describe('AddTransactionForm', () => {
  it('renders the section heading', () => {
    render(<AddTransactionForm categories={CATEGORIES} onAdd={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Add transaction' })).toBeInTheDocument();
  });

  it('renders Amount, Type, Category, Date, Note fields', () => {
    render(<AddTransactionForm categories={CATEGORIES} onAdd={vi.fn()} />);
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
  });

  it('calls onAdd with correct data on valid submission', () => {
    const onAdd = vi.fn();
    render(<AddTransactionForm categories={CATEGORIES} onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '42.50' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'income' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Transport' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: TODAY } });
    fireEvent.change(screen.getByLabelText(/note/i), { target: { value: 'Test note' } });
    fireEvent.submit(screen.getByRole('button', { name: /add transaction/i }).closest('form')!);
    expect(onAdd).toHaveBeenCalledWith({
      amount: 42.5,
      type: 'income',
      category: 'Transport',
      note: 'Test note',
      date: TODAY,
    });
  });

  it('does not call onAdd when amount is empty', () => {
    const onAdd = vi.fn();
    render(<AddTransactionForm categories={CATEGORIES} onAdd={onAdd} />);
    fireEvent.submit(screen.getByRole('button', { name: /add transaction/i }).closest('form')!);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when amount is zero', () => {
    const onAdd = vi.fn();
    render(<AddTransactionForm categories={CATEGORIES} onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '0' } });
    fireEvent.submit(screen.getByRole('button', { name: /add transaction/i }).closest('form')!);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('resets amount and note after successful submission', () => {
    render(<AddTransactionForm categories={CATEGORIES} onAdd={vi.fn()} />);
    const amountInput = screen.getByLabelText('Amount') as HTMLInputElement;
    const noteInput = screen.getByLabelText(/note/i) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '10' } });
    fireEvent.change(noteInput, { target: { value: 'My note' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: TODAY } });
    fireEvent.submit(amountInput.closest('form')!);
    expect(amountInput.value).toBe('');
    expect(noteInput.value).toBe('');
  });

  it('renders category options from props', () => {
    render(<AddTransactionForm categories={CATEGORIES} onAdd={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Transport' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument();
  });
});
