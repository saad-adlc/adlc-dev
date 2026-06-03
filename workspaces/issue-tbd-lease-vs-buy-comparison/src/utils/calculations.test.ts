import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyLoanPayment,
  calculateTotalLeaseCost,
  calculateTotalBuyCost,
} from './calculations';

describe('calculateMonthlyLoanPayment', () => {
  it('returns correct payment for standard loan', () => {
    // $20,000 loan at 6% annual for 36 months
    const result = calculateMonthlyLoanPayment(20000, 6, 36);
    expect(result).toBeCloseTo(608.44, 1);
  });

  it('returns principal/term when rate is 0', () => {
    const result = calculateMonthlyLoanPayment(12000, 0, 12);
    expect(result).toBeCloseTo(1000, 2);
  });

  it('returns 0 when principal is 0', () => {
    expect(calculateMonthlyLoanPayment(0, 5, 24)).toBe(0);
  });

  it('returns 0 when term is 0', () => {
    expect(calculateMonthlyLoanPayment(10000, 5, 0)).toBe(0);
  });
});

describe('calculateTotalLeaseCost', () => {
  it('returns monthly payment multiplied by term', () => {
    expect(calculateTotalLeaseCost(500, 36)).toBe(18000);
  });

  it('returns 0 when payment is 0', () => {
    expect(calculateTotalLeaseCost(0, 24)).toBe(0);
  });

  it('returns 0 when term is 0', () => {
    expect(calculateTotalLeaseCost(500, 0)).toBe(0);
  });
});

describe('calculateTotalBuyCost', () => {
  it('returns total outlay minus residual value', () => {
    // $500/mo payment over 36 months + $5,000 down - $8,000 residual
    const result = calculateTotalBuyCost(500, 36, 5000, 8000);
    expect(result).toBe(18000 + 5000 - 8000); // 15000
  });

  it('returns total outlay when residual is 0', () => {
    const result = calculateTotalBuyCost(500, 36, 5000, 0);
    expect(result).toBe(23000);
  });

  it('returns 0 when all values are 0', () => {
    expect(calculateTotalBuyCost(0, 0, 0, 0)).toBe(0);
  });

  it('does not return negative values when residual exceeds outlay', () => {
    // Residual larger than total outlay — clamp to 0
    const result = calculateTotalBuyCost(100, 12, 0, 99999);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
