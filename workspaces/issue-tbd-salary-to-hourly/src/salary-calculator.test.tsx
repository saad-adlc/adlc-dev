import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import SalaryCalculator, { calculateRates } from './salary-calculator';

/** Helpers to parse displayed currency strings back to numbers */
const parseRate = (text: string): number =>
  parseFloat(text.replace(/[^0-9.]/g, ''));

describe('App', () => {
  it('renders the salary calculator', () => {
    render(<App />);
    expect(screen.getByText(/salary calculator/i)).toBeInTheDocument();
  });
});

describe('calculateRates', () => {
  it('returns zeros when totalHours is 0', () => {
    const result = calculateRates(50000, 0, 52);
    expect(result).toEqual({ hourly: 0, daily: 0, weekly: 0, monthly: 0 });
  });

  it('returns zeros when salary is 0', () => {
    const result = calculateRates(0, 40, 52);
    expect(result).toEqual({ hourly: 0, daily: 0, weekly: 0, monthly: 0 });
  });

  it('returns zeros when salary is negative', () => {
    const result = calculateRates(-1, 40, 52);
    expect(result).toEqual({ hourly: 0, daily: 0, weekly: 0, monthly: 0 });
  });

  it('calculates correct rates for known values', () => {
    const r = calculateRates(104000, 40, 52);
    expect(r.hourly).toBeCloseTo(50, 2);
    expect(r.daily).toBeCloseTo(400, 2);
    expect(r.weekly).toBeCloseTo(2000, 2);
    expect(r.monthly).toBeCloseTo(8666.67, 0);
  });
});

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
    expect(parseRate(screen.getByTestId('rate-hourly').textContent ?? '')).toBeCloseTo(50, 1);
    expect(parseRate(screen.getByTestId('rate-daily').textContent ?? '')).toBeCloseTo(400, 1);
    expect(parseRate(screen.getByTestId('rate-weekly').textContent ?? '')).toBeCloseTo(2000, 1);
    expect(parseRate(screen.getByTestId('rate-monthly').textContent ?? '')).toBeCloseTo(8666.67, 0);
  });

  it('recalculates live when hours/week changes', () => {
    render(<SalaryCalculator />);
    fireEvent.change(screen.getByLabelText(/annual salary/i), { target: { value: '52000' } });
    fireEvent.change(screen.getByLabelText(/hours.*week/i), { target: { value: '20' } });
    expect(parseRate(screen.getByTestId('rate-hourly').textContent ?? '')).toBeCloseTo(50, 1);
  });

  it('shows 0 for all rates when salary is empty', () => {
    render(<SalaryCalculator />);
    expect(parseRate(screen.getByTestId('rate-hourly').textContent ?? '')).toBe(0);
    expect(parseRate(screen.getByTestId('rate-daily').textContent ?? '')).toBe(0);
  });
});
