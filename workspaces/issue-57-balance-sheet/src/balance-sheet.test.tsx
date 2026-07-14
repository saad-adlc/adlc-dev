import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BalanceSheet from './balance-sheet';

describe('BalanceSheet', () => {
  it('renders three section headings', () => {
    render(<BalanceSheet />);
    expect(screen.getByRole('heading', { name: 'Assets' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Liabilities' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Equity' })).toBeInTheDocument();
  });

  it('loads all prefilled line item names', () => {
    render(<BalanceSheet />);
    expect(screen.getByDisplayValue('Cash')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Accounts receivable')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Equipment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Accounts payable')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bank loan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Common stock')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Retained earnings')).toBeInTheDocument();
  });

  it('shows "In balance" on initial load', () => {
    render(<BalanceSheet />);
    expect(screen.getByText(/In balance/)).toBeInTheDocument();
  });

  it('displays total assets and total liabilities + equity labels', () => {
    render(<BalanceSheet />);
    expect(screen.getByText(/Total Assets/)).toBeInTheDocument();
    expect(screen.getByText(/Total Liabilities/)).toBeInTheDocument();
  });

  it('adds a new empty line to the Assets section', () => {
    render(<BalanceSheet />);
    const addBtns = screen.getAllByText('+ Add line');
    fireEvent.click(addBtns[0]);
    const assetSection = screen.getByTestId('section-assets');
    const nameInputs = within(assetSection).getAllByRole('textbox', { name: /account name/i });
    expect(nameInputs).toHaveLength(4);
  });

  it('removes a line item from a section', () => {
    render(<BalanceSheet />);
    fireEvent.click(screen.getByRole('button', { name: /remove cash/i }));
    expect(screen.queryByDisplayValue('Cash')).not.toBeInTheDocument();
  });

  it('updates Assets subtotal when an amount is edited', () => {
    render(<BalanceSheet />);
    fireEvent.change(screen.getByDisplayValue('12000'), { target: { value: '20000' } });
    expect(screen.getByText(/Subtotal: \$58,000\.00/)).toBeInTheDocument();
  });

  it('shows out-of-balance when assets exceed claims', () => {
    render(<BalanceSheet />);
    fireEvent.change(screen.getByDisplayValue('12000'), { target: { value: '16000' } });
    expect(screen.getByText(/Out of balance by.*assets exceed claims/)).toBeInTheDocument();
  });

  it('shows correct difference amount when out of balance', () => {
    render(<BalanceSheet />);
    fireEvent.change(screen.getByDisplayValue('12000'), { target: { value: '16000' } });
    expect(screen.getByText(/\$4,000\.00/)).toBeInTheDocument();
  });

  it('shows out-of-balance when claims exceed assets', () => {
    render(<BalanceSheet />);
    fireEvent.change(screen.getByDisplayValue('9000'), { target: { value: '13000' } });
    expect(screen.getByText(/Out of balance by.*claims exceed assets/)).toBeInTheDocument();
  });

  it('returns to "In balance" after correcting an amount', () => {
    render(<BalanceSheet />);
    const cashInput = screen.getByDisplayValue('12000');
    fireEvent.change(cashInput, { target: { value: '16000' } });
    expect(screen.getByText(/Out of balance/)).toBeInTheDocument();
    fireEvent.change(cashInput, { target: { value: '12000' } });
    expect(screen.getByText(/In balance/)).toBeInTheDocument();
  });

  it('flags a non-numeric amount with an alert', () => {
    render(<BalanceSheet />);
    fireEvent.change(screen.getByDisplayValue('12000'), { target: { value: 'abc' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('excludes a non-numeric amount from the subtotal', () => {
    render(<BalanceSheet />);
    fireEvent.change(screen.getByDisplayValue('12000'), { target: { value: 'abc' } });
    expect(screen.getByText(/Subtotal: \$38,000\.00/)).toBeInTheDocument();
  });

  it('treats a blank amount as 0 with no alert', () => {
    render(<BalanceSheet />);
    fireEvent.change(screen.getByDisplayValue('12000'), { target: { value: '' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText(/Subtotal: \$38,000\.00/)).toBeInTheDocument();
  });

  it('accepts a negative amount in the subtotal', () => {
    render(<BalanceSheet />);
    fireEvent.change(screen.getByDisplayValue('12000'), { target: { value: '-5000' } });
    expect(screen.getByText(/Subtotal: \$33,000\.00/)).toBeInTheDocument();
  });

  it('renders the SVG balance visual', () => {
    render(<BalanceSheet />);
    expect(screen.getByRole('img', { name: /balance chart/i })).toBeInTheDocument();
  });
});
