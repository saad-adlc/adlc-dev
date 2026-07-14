import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SummaryCards from './summary-cards';

describe('SummaryCards', () => {
  it('displays total spent', () => {
    render(<SummaryCards total={123.45} count={3} topCategory="Food" />);
    expect(screen.getByText('$123.45')).toBeInTheDocument();
  });

  it('displays expense count', () => {
    render(<SummaryCards total={0} count={7} topCategory="Food" />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('displays top category', () => {
    render(<SummaryCards total={0} count={0} topCategory="Travel" />);
    expect(screen.getByText('Travel')).toBeInTheDocument();
  });

  it('shows dash when no top category', () => {
    render(<SummaryCards total={0} count={0} topCategory="" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
