import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

const TODAY = new Date().toISOString().slice(0, 10);

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText(/Income.*Expense Tracker/i)).toBeInTheDocument();
  });

  it('renders summary cards with zero values on empty state', () => {
    render(<App />);
    expect(screen.getByText('Total income')).toBeInTheDocument();
    expect(screen.getByText('Total expenses')).toBeInTheDocument();
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getAllByText('$0.00').length).toBeGreaterThanOrEqual(3);
  });

  it('renders the empty transaction list message', () => {
    render(<App />);
    expect(screen.getByText(/no transactions for this month/i)).toBeInTheDocument();
  });

  it('adds an expense and updates totals', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: TODAY } });
    fireEvent.submit(
      screen.getByRole('button', { name: /add transaction/i }).closest('form')!,
    );
    expect(screen.queryByText(/no transactions for this month/i)).not.toBeInTheDocument();
    expect(screen.getByText('$80.00')).toBeInTheDocument();
  });

  it('adds an income and shows it in the list', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'income' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: TODAY } });
    fireEvent.submit(
      screen.getByRole('button', { name: /add transaction/i }).closest('form')!,
    );
    expect(screen.getByText('+$200.00')).toBeInTheDocument();
  });

  it('deletes a transaction', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: TODAY } });
    fireEvent.submit(
      screen.getByRole('button', { name: /add transaction/i }).closest('form')!,
    );
    fireEvent.click(screen.getByRole('button', { name: /delete transaction/i }));
    expect(screen.queryByRole('button', { name: /delete transaction/i })).not.toBeInTheDocument();
    expect(screen.getByText(/no transactions for this month/i)).toBeInTheDocument();
  });

  it('navigates to the previous month', () => {
    render(<App />);
    const currentLabel = screen.getAllByText(/\d{4}/)[0].textContent;
    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    const newLabel = screen.getAllByText(/\d{4}/)[0].textContent;
    expect(newLabel).not.toBe(currentLabel);
  });

  it('navigates to the next month', () => {
    render(<App />);
    const currentLabel = screen.getAllByText(/\d{4}/)[0].textContent;
    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    const newLabel = screen.getAllByText(/\d{4}/)[0].textContent;
    expect(newLabel).not.toBe(currentLabel);
  });

  it('does not add a transaction when amount is empty', () => {
    render(<App />);
    fireEvent.submit(
      screen.getByRole('button', { name: /add transaction/i }).closest('form')!,
    );
    expect(screen.getByText(/no transactions for this month/i)).toBeInTheDocument();
  });

  it('renders budget section heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Budget/i })).toBeInTheDocument();
  });
});
