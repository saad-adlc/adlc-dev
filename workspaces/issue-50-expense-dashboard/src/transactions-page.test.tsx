import { render, screen, fireEvent } from '@testing-library/react';
import TransactionsPage from './transactions-page';
import { EXPENSES } from './expenses';

describe('TransactionsPage', () => {
  it('renders 8 data rows by default (plus header)', () => {
    render(<TransactionsPage expenses={EXPENSES} />);
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(9);
  });

  it('renders column headers', () => {
    render(<TransactionsPage expenses={EXPENSES} />);
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Merchant')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('shows All filter button', () => {
    render(<TransactionsPage expenses={EXPENSES} />);
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
  });

  it('shows a filter button for each category', () => {
    render(<TransactionsPage expenses={EXPENSES} />);
    expect(screen.getByRole('button', { name: 'Bills' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Food' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shopping' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transport' })).toBeInTheDocument();
  });

  it('filters to 2 rows when Food is selected', () => {
    render(<TransactionsPage expenses={EXPENSES} />);
    fireEvent.click(screen.getByRole('button', { name: 'Food' }));
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);
  });

  it('filters to 2 rows when Bills is selected', () => {
    render(<TransactionsPage expenses={EXPENSES} />);
    fireEvent.click(screen.getByRole('button', { name: 'Bills' }));
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);
  });

  it('restores all 8 rows when All is clicked after a filter', () => {
    render(<TransactionsPage expenses={EXPENSES} />);
    fireEvent.click(screen.getByRole('button', { name: 'Food' }));
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(9);
  });

  it('displays amounts with 2 decimal places', () => {
    render(<TransactionsPage expenses={EXPENSES} />);
    expect(screen.getByText('$84.20')).toBeInTheDocument();
    expect(screen.getByText('$140.00')).toBeInTheDocument();
  });

  it('renders with no expenses without crashing', () => {
    render(<TransactionsPage expenses={[]} />);
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1);
  });
});
