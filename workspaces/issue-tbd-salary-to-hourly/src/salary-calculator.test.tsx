import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SalaryCalculator from './salary-calculator';

/** Helpers to parse displayed currency strings back to numbers */
const parseRate = (text: string): number =>
  parseFloat(text.replace(/[^0-9.]/g, ''));

describe('SalaryCalculator', () => {
  it('renders all three input fields', () => {
    render(<SalaryCalculator />);
    expect(screen.getByLabelText(/annual salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hours.*week/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weeks.*year/i)).toBeInTheDocument();
  });

  it('pre-fills hours/week with 40 and weeks/year with 52', () => {
    render(<SalaryCalculator />);
    expect(screen.getByLabelText(/hours.*week/i)).toHaveValue(40);
    expect(screen.getByLabelText(/weeks.*year/i)).toHaveValue(52);
  });

  it('renders all four output labels', () => {
    render(<SalaryCalculator />);
    expect(screen.getByText(/hourly/i)).toBeInTheDocument();
    expect(screen.getByText(/daily/i)).toBeInTheDocument();
    expect(screen.getByText(/weekly/i)).toBeInTheDocument();
    expect(screen.getByText(/monthly/i)).toBeInTheDocument();
  });

  it('calculates correct rates for $104,000 / 40 hrs / 52 weeks', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/annual salary/i), {
      target: { value: '104000' },
    });

    // 104000 / (40 * 52) = 50.00 hourly
    expect(parseRate(screen.getByTestId('rate-hourly').textContent ?? '')).toBeCloseTo(50, 1);
    // 50 * 8 = 400.00 daily
    expect(parseRate(screen.getByTestId('rate-daily').textContent ?? '')).toBeCloseTo(400, 1);
    // 50 * 40 = 2000.00 weekly
    expect(parseRate(screen.getByTestId('rate-weekly').textContent ?? '')).toBeCloseTo(2000, 1);
    // 104000 / 12 = 8666.67 monthly
    expect(parseRate(screen.getByTestId('rate-monthly').textContent ?? '')).toBeCloseTo(8666.67, 0);
  });

  it('recalculates live when hours/week changes', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/annual salary/i), {
      target: { value: '52000' },
    });
    fireEvent.change(screen.getByLabelText(/hours.*week/i), {
      target: { value: '20' },
    });
    // 52000 / (20 * 52) = 50.00 hourly
    expect(parseRate(screen.getByTestId('rate-hourly').textContent ?? '')).toBeCloseTo(50, 1);
  });

  it('shows 0 for all rates when salary is empty', () => {
    render(<SalaryCalculator />);
    // salary input starts empty — rates should be 0
    expect(parseRate(screen.getByTestId('rate-hourly').textContent ?? '')).toBe(0);
    expect(parseRate(screen.getByTestId('rate-daily').textContent ?? '')).toBe(0);
  });
});
