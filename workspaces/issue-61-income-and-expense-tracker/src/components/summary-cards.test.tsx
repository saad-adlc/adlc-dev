import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SummaryCards from './summary-cards';

describe('SummaryCards', () => {
  it('renders zero values on empty state', () => {
    render(<SummaryCards income={0} expenses={0} balance={0} />);
    expect(screen.getAllByText('$0.00')).toHaveLength(3);
  });

  it('renders total income label', () => {
    render(<SummaryCards income={0} expenses={0} balance={0} />);
    expect(screen.getByText('Total income')).toBeInTheDocument();
  });

  it('renders total expenses label', () => {
    render(<SummaryCards income={0} expenses={0} balance={0} />);
    expect(screen.getByText('Total expenses')).toBeInTheDocument();
  });

  it('renders balance label', () => {
    render(<SummaryCards income={0} expenses={0} balance={0} />);
    expect(screen.getByText('Balance')).toBeInTheDocument();
  });

  it('shows formatted income amount', () => {
    render(<SummaryCards income={200} expenses={0} balance={200} />);
    expect(screen.getAllByText('$200.00').length).toBeGreaterThanOrEqual(1);
  });

  it('shows formatted expense amount', () => {
    render(<SummaryCards income={200} expenses={80} balance={120} />);
    expect(screen.getByText('$80.00')).toBeInTheDocument();
  });

  it('shows formatted balance', () => {
    render(<SummaryCards income={200} expenses={80} balance={120} />);
    expect(screen.getByText('$120.00')).toBeInTheDocument();
  });

  it('shows negative balance with minus sign', () => {
    render(<SummaryCards income={50} expenses={100} balance={-50} />);
    expect(screen.getByText('-$50.00')).toBeInTheDocument();
  });
});
