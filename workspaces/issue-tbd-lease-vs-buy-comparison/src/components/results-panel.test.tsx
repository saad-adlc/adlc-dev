import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultsPanel, { getWinner } from './results-panel';

describe('getWinner', () => {
  it('returns lease when lease cost is lower', () => {
    expect(getWinner(10000, 15000)).toBe('lease');
  });

  it('returns buy when buy cost is lower', () => {
    expect(getWinner(15000, 10000)).toBe('buy');
  });

  it('returns tie when costs are equal', () => {
    expect(getWinner(12000, 12000)).toBe('tie');
  });
});

describe('ResultsPanel', () => {
  const baseProps = {
    monthlyLeasePayment: 500,
    monthlyLoanPayment: 608.44,
    totalLeaseCost: 18000,
    totalBuyCost: 22000,
    isValid: true,
  };

  it('renders the empty state when isValid is false', () => {
    render(<ResultsPanel {...baseProps} isValid={false} />);
    expect(screen.getByText(/enter all values above/i)).toBeInTheDocument();
  });

  it('renders the results table when valid', () => {
    render(<ResultsPanel {...baseProps} />);
    expect(screen.getByText('Monthly Payment')).toBeInTheDocument();
    expect(screen.getByText('Total Cost (over term)')).toBeInTheDocument();
  });

  it('shows the lease winner label when lease is cheaper', () => {
    render(<ResultsPanel {...baseProps} totalLeaseCost={18000} totalBuyCost={22000} />);
    expect(screen.getByText(/leasing is cheaper/i)).toBeInTheDocument();
  });

  it('shows the buy winner label when buy is cheaper', () => {
    render(<ResultsPanel {...baseProps} totalLeaseCost={22000} totalBuyCost={18000} />);
    expect(screen.getByText(/buying is cheaper/i)).toBeInTheDocument();
  });

  it('shows the tie label when costs are equal', () => {
    render(<ResultsPanel {...baseProps} totalLeaseCost={20000} totalBuyCost={20000} />);
    expect(screen.getByText(/both options cost the same/i)).toBeInTheDocument();
  });

  it('displays formatted USD values', () => {
    render(<ResultsPanel {...baseProps} />);
    expect(screen.getByText('$18,000.00')).toBeInTheDocument();
  });
});
