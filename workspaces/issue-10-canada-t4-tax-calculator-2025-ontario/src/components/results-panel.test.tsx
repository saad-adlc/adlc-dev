import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultsPanel from './results-panel';
import { type TaxResult } from '../utils/tax-calc';

const mockResult: TaxResult = {
  gross: 80_000,
  cpp: 4_145.5,
  ei: 1_077.48,
  federalTax: {
    brackets: [
      { lower: 0, upper: 57_375, rate: 0.15, taxableAmount: 57_375, tax: 8_606.25 },
      { lower: 57_375, upper: 114_750, rate: 0.205, taxableAmount: 6_496, tax: 1_331.68 },
      { lower: 114_750, upper: 158_519, rate: 0.26, taxableAmount: 0, tax: 0 },
      { lower: 158_519, upper: 220_000, rate: 0.29, taxableAmount: 0, tax: 0 },
      { lower: 220_000, upper: null, rate: 0.33, taxableAmount: 0, tax: 0 },
    ],
    totalTax: 9_937.93,
  },
  provincialTax: {
    brackets: [
      { lower: 0, upper: 51_446, rate: 0.0505, taxableAmount: 51_446, tax: 2_598.02 },
      { lower: 51_446, upper: 102_894, rate: 0.0915, taxableAmount: 16_689, tax: 1_527.04 },
      { lower: 102_894, upper: 150_000, rate: 0.1116, taxableAmount: 0, tax: 0 },
      { lower: 150_000, upper: 220_000, rate: 0.1216, taxableAmount: 0, tax: 0 },
      { lower: 220_000, upper: null, rate: 0.1316, taxableAmount: 0, tax: 0 },
    ],
    totalTax: 4_125.06,
  },
  totalDeductions: 19_286.0,
  netAnnual: 60_714.0,
  netMonthly: 5_059.5,
  netPerPaycheque: 2_335.15,
};

describe('ResultsPanel', () => {
  it('renders the section landmark', () => {
    render(<ResultsPanel result={mockResult} />);
    expect(screen.getByRole('region', { name: /tax calculation results/i })).toBeTruthy();
  });

  it('displays the gross income', () => {
    render(<ResultsPanel result={mockResult} />);
    const el = screen.getByTestId('gross');
    expect(el.textContent).toContain('80,000');
  });

  it('displays the CPP deduction', () => {
    render(<ResultsPanel result={mockResult} />);
    const el = screen.getByTestId('cpp');
    expect(el.textContent).toContain('4,145.50');
  });

  it('displays the EI premium', () => {
    render(<ResultsPanel result={mockResult} />);
    const el = screen.getByTestId('ei');
    expect(el.textContent).toContain('1,077.48');
  });

  it('renders 5 federal tax bracket rows', () => {
    render(<ResultsPanel result={mockResult} />);
    const rows = [0, 1, 2, 3, 4].map((i) =>
      screen.getByTestId(`federal-bracket-${i}`)
    );
    expect(rows).toHaveLength(5);
  });

  it('renders 5 Ontario provincial tax bracket rows', () => {
    render(<ResultsPanel result={mockResult} />);
    const rows = [0, 1, 2, 3, 4].map((i) =>
      screen.getByTestId(`ontario-bracket-${i}`)
    );
    expect(rows).toHaveLength(5);
  });

  it('displays the federal tax total', () => {
    render(<ResultsPanel result={mockResult} />);
    const el = screen.getByTestId('federal-total');
    expect(el.textContent).toContain('9,937.93');
  });

  it('displays the Ontario provincial tax total', () => {
    render(<ResultsPanel result={mockResult} />);
    const el = screen.getByTestId('ontario-total');
    expect(el.textContent).toContain('4,125.06');
  });

  it('displays total deductions', () => {
    render(<ResultsPanel result={mockResult} />);
    const el = screen.getByTestId('total-deductions');
    expect(el.textContent).toContain('19,286');
  });

  it('displays net annual take-home', () => {
    render(<ResultsPanel result={mockResult} />);
    const el = screen.getByTestId('net-annual');
    expect(el.textContent).toContain('60,714');
  });

  it('displays net monthly take-home', () => {
    render(<ResultsPanel result={mockResult} />);
    const el = screen.getByTestId('net-monthly');
    expect(el.textContent).toContain('5,059.50');
  });

  it('displays net per-paycheque take-home', () => {
    render(<ResultsPanel result={mockResult} />);
    const el = screen.getByTestId('net-paycheque');
    expect(el.textContent).toContain('2,335.15');
  });

  it('shows top federal bracket with + symbol (no upper bound)', () => {
    render(<ResultsPanel result={mockResult} />);
    const row = screen.getByTestId('federal-bracket-4');
    expect(row.textContent).toContain('+');
  });

  it('shows top Ontario bracket with + symbol (no upper bound)', () => {
    render(<ResultsPanel result={mockResult} />);
    const row = screen.getByTestId('ontario-bracket-4');
    expect(row.textContent).toContain('+');
  });
});
