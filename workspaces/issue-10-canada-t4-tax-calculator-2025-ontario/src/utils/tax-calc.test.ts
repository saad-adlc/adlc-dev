import { describe, it, expect } from 'vitest';
import {
  calculateGrossFromHourly,
  calculateCpp,
  calculateEi,
  calculateFederalTax,
  calculateOntarioTax,
  calculateTaxResult,
} from './tax-calc';

describe('calculateGrossFromHourly', () => {
  it('computes annual gross from hourly rate and hours', () => {
    expect(calculateGrossFromHourly(25, 40)).toBe(52_000);
  });

  it('handles fractional rates', () => {
    // 19.23 * 40 * 52 = 39998.4
    expect(calculateGrossFromHourly(19.23, 40)).toBeCloseTo(39_998.4, 1);
  });

  it('returns 0 for 0 hours', () => {
    expect(calculateGrossFromHourly(50, 0)).toBe(0);
  });
});

describe('calculateCpp', () => {
  it('returns 0 when gross is below basic exemption', () => {
    expect(calculateCpp(3_000)).toBe(0);
  });

  it('returns 0 when gross equals basic exemption', () => {
    expect(calculateCpp(3_500)).toBe(0);
  });

  it('calculates CPP correctly for mid-range income', () => {
    // (50000 - 3500) * 0.0595 = 46500 * 0.0595 = 2766.75
    expect(calculateCpp(50_000)).toBeCloseTo(2_766.75, 2);
  });

  it('caps at max contribution when gross exceeds max pensionable', () => {
    expect(calculateCpp(200_000)).toBe(4_145.5);
  });

  it('is the same for any income above max pensionable threshold', () => {
    expect(calculateCpp(100_000)).toBe(calculateCpp(200_000));
  });
});

describe('calculateEi', () => {
  it('calculates EI for income below max insurable', () => {
    // 50000 * 0.0164 = 820
    expect(calculateEi(50_000)).toBeCloseTo(820, 2);
  });

  it('caps at max premium when income equals max insurable', () => {
    expect(calculateEi(65_700)).toBeCloseTo(1_077.48, 2);
  });

  it('caps at max premium for income above max insurable', () => {
    expect(calculateEi(200_000)).toBeCloseTo(1_077.48, 2);
  });

  it('calculates proportionally for low income', () => {
    expect(calculateEi(10_000)).toBeCloseTo(164, 2);
  });
});

describe('calculateFederalTax', () => {
  it('returns 0 for income at or below BPA', () => {
    expect(calculateFederalTax(16_129).totalTax).toBe(0);
  });

  it('returns 0 for income below BPA', () => {
    expect(calculateFederalTax(10_000).totalTax).toBe(0);
  });

  it('taxes only bracket 1 for income just above BPA', () => {
    // gross = 40000, taxable = 40000 - 16129 = 23871
    const result = calculateFederalTax(40_000);
    expect(result.brackets[0].taxableAmount).toBeCloseTo(23_871, 0);
    expect(result.brackets[1].taxableAmount).toBe(0);
    expect(result.totalTax).toBeCloseTo(23_871 * 0.15, 2);
  });

  it('spans two brackets for income of $100k', () => {
    // taxable = 100000 - 16129 = 83871
    // bracket 1: 57375, bracket 2: 83871 - 57375 = 26496
    const result = calculateFederalTax(100_000);
    expect(result.brackets[0].taxableAmount).toBeCloseTo(57_375, 0);
    expect(result.brackets[1].taxableAmount).toBeCloseTo(26_496, 0);
    expect(result.brackets[2].taxableAmount).toBe(0);
  });

  it('spans all 5 brackets for very high income', () => {
    const result = calculateFederalTax(300_000);
    result.brackets.forEach((b) => expect(b.taxableAmount).toBeGreaterThan(0));
  });

  it('returns exactly 5 brackets', () => {
    expect(calculateFederalTax(300_000).brackets).toHaveLength(5);
  });

  it('top bracket has null upper bound', () => {
    expect(calculateFederalTax(300_000).brackets[4].upper).toBeNull();
  });

  it('totalTax equals sum of bracket taxes', () => {
    const result = calculateFederalTax(150_000);
    const sum = result.brackets.reduce((acc, b) => acc + b.tax, 0);
    expect(result.totalTax).toBeCloseTo(sum, 6);
  });
});

describe('calculateOntarioTax', () => {
  it('returns 0 for income below Ontario BPA', () => {
    expect(calculateOntarioTax(10_000).totalTax).toBe(0);
  });

  it('taxes only bracket 1 for low income', () => {
    // gross = 30000, taxable = 30000 - 11865 = 18135
    const result = calculateOntarioTax(30_000);
    expect(result.brackets[0].taxableAmount).toBeCloseTo(18_135, 0);
    expect(result.totalTax).toBeCloseTo(18_135 * 0.0505, 2);
  });

  it('spans three brackets for $120k income', () => {
    // taxable = 120000 - 11865 = 108135
    // bracket 3: 108135 - 102894 = 5241
    const result = calculateOntarioTax(120_000);
    expect(result.brackets[2].taxableAmount).toBeCloseTo(5_241, 0);
    expect(result.brackets[3].taxableAmount).toBe(0);
  });

  it('returns exactly 5 brackets', () => {
    expect(calculateOntarioTax(300_000).brackets).toHaveLength(5);
  });

  it('top bracket has null upper bound', () => {
    expect(calculateOntarioTax(300_000).brackets[4].upper).toBeNull();
  });

  it('totalTax equals sum of bracket taxes', () => {
    const result = calculateOntarioTax(200_000);
    const sum = result.brackets.reduce((acc, b) => acc + b.tax, 0);
    expect(result.totalTax).toBeCloseTo(sum, 6);
  });
});

describe('calculateTaxResult', () => {
  it('preserves the gross income', () => {
    expect(calculateTaxResult(80_000).gross).toBe(80_000);
  });

  it('totalDeductions equals cpp + ei + federal + provincial', () => {
    const r = calculateTaxResult(80_000);
    const expected = r.cpp + r.ei + r.federalTax.totalTax + r.provincialTax.totalTax;
    expect(r.totalDeductions).toBeCloseTo(expected, 6);
  });

  it('netAnnual equals gross minus totalDeductions', () => {
    const r = calculateTaxResult(80_000);
    expect(r.netAnnual).toBeCloseTo(r.gross - r.totalDeductions, 6);
  });

  it('netMonthly equals netAnnual divided by 12', () => {
    const r = calculateTaxResult(80_000);
    expect(r.netMonthly).toBeCloseTo(r.netAnnual / 12, 6);
  });

  it('netPerPaycheque equals netAnnual divided by 26', () => {
    const r = calculateTaxResult(80_000);
    expect(r.netPerPaycheque).toBeCloseTo(r.netAnnual / 26, 6);
  });

  it('computes reasonable deductions for $80k salary', () => {
    const r = calculateTaxResult(80_000);
    expect(r.cpp).toBe(4_145.5);
    expect(r.ei).toBeCloseTo(1_077.48, 2);
    expect(r.totalDeductions).toBeGreaterThan(15_000);
    expect(r.netAnnual).toBeGreaterThan(50_000);
  });
});
