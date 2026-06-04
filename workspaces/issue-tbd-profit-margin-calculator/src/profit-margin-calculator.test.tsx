import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProfitMarginCalculator from './profit-margin-calculator';

describe('ProfitMarginCalculator', () => {
  it('renders the revenue and cost inputs', () => {
    render(<ProfitMarginCalculator />);
    expect(screen.getByLabelText(/revenue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total cost/i)).toBeInTheDocument();
  });

  it('shows placeholder results when inputs are empty', () => {
    render(<ProfitMarginCalculator />);
    expect(screen.getByText(/enter values above/i)).toBeInTheDocument();
  });

  it('calculates gross margin % correctly', () => {
    render(<ProfitMarginCalculator />);
    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/total cost/i), { target: { value: '600' } });
    expect(screen.getByText(/40\.0%/)).toBeInTheDocument();
  });

  it('calculates net profit correctly', () => {
    render(<ProfitMarginCalculator />);
    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/total cost/i), { target: { value: '600' } });
    expect(screen.getByText(/400/)).toBeInTheDocument();
  });

  it('shows red health status when margin is below 10%', () => {
    render(<ProfitMarginCalculator />);
    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/total cost/i), { target: { value: '950' } });
    expect(screen.getByTestId('health-bar')).toHaveClass('health-bar--red');
  });

  it('shows amber health status when margin is between 10% and 25%', () => {
    render(<ProfitMarginCalculator />);
    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/total cost/i), { target: { value: '850' } });
    expect(screen.getByTestId('health-bar')).toHaveClass('health-bar--amber');
  });

  it('shows green health status when margin is above 25%', () => {
    render(<ProfitMarginCalculator />);
    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/total cost/i), { target: { value: '600' } });
    expect(screen.getByTestId('health-bar')).toHaveClass('health-bar--green');
  });

  it('handles zero revenue without crashing', () => {
    render(<ProfitMarginCalculator />);
    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/total cost/i), { target: { value: '500' } });
    expect(screen.getByText(/enter values above/i)).toBeInTheDocument();
  });

  it('handles cost exceeding revenue (negative margin)', () => {
    render(<ProfitMarginCalculator />);
    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/total cost/i), { target: { value: '700' } });
    expect(screen.getByTestId('health-bar')).toHaveClass('health-bar--red');
  });

  it('handles non-numeric input gracefully', () => {
    render(<ProfitMarginCalculator />);
    fireEvent.change(screen.getByLabelText(/revenue/i), { target: { value: 'abc' } });
    expect(screen.getByText(/enter values above/i)).toBeInTheDocument();
  });
});
