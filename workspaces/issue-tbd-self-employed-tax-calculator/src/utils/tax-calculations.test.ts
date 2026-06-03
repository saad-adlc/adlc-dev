import { describe, it, expect } from 'vitest';
import {
  calcSETax,
  calcFederalIncomeTax,
  calcQBIDeduction,
  calcTaxSavings,
} from './tax-calculations';

describe('calcSETax', () => {
  it('returns 0 for zero income', () => {
    expect(calcSETax(0)).toBe(0);
  });

  it('calculates SE tax correctly for income below SS wage base', () => {
    // $80,000 * 0.9235 = $73,880 net SE income
    // SE tax = $73,880 * 0.153 = $11,303.64
    const result = calcSETax(80000);
    expect(result).toBeCloseTo(11303.64, 1);
  });

  it('caps Social Security portion at SS wage base', () => {
    // Above $176,100 only Medicare (2.9%) applies on the excess
    const result = calcSETax(300000);
    expect(result).toBeGreaterThan(0);
    // At $300k: SS portion = $176,100 * 0.124, Medicare = $300k * 0.9235 * 0.029
    const ssBase = 176100;
    const netIncome = 300000 * 0.9235;
    const expected = ssBase * 0.124 + netIncome * 0.029;
    expect(result).toBeCloseTo(expected, 0);
  });
});

describe('calcFederalIncomeTax', () => {
  it('returns 0 for zero taxable income', () => {
    expect(calcFederalIncomeTax(0, 'single')).toBe(0);
  });

  it('returns 0 for negative taxable income', () => {
    expect(calcFederalIncomeTax(-1000, 'single')).toBe(0);
  });

  it('calculates correct tax for single filer at first bracket only', () => {
    // $10,000 taxable income: 10% of $10,000 = $1,000
    expect(calcFederalIncomeTax(10000, 'single')).toBeCloseTo(1000, 0);
  });

  it('calculates correct tax for single filer spanning multiple brackets', () => {
    // $50,000 taxable income (single, 2025):
    // 10%  on $0      – $11,925  = $1,192.50
    // 12%  on $11,925 – $48,475  = $4,386.00
    // 22%  on $48,475 – $50,000  = $335.50
    // Total = $5,914.00
    expect(calcFederalIncomeTax(50000, 'single')).toBeCloseTo(5914, 0);
  });

  it('calculates correct tax for MFJ filer', () => {
    // $60,000 taxable income (MFJ, 2025):
    // 10% on $0 – $23,850    = $2,385
    // 12% on $23,850 – $60,000 = $4,338
    // Total = $6,723
    expect(calcFederalIncomeTax(60000, 'mfj')).toBeCloseTo(6723, 0);
  });
});

describe('calcQBIDeduction', () => {
  it('returns 0 for zero income', () => {
    expect(calcQBIDeduction(0, 'single')).toBe(0);
  });

  it('applies 20% deduction below threshold', () => {
    // $80,000 net SE income: QBI = $80,000 * 0.2 = $16,000
    expect(calcQBIDeduction(80000, 'single')).toBeCloseTo(16000, 0);
  });

  it('returns 0 above threshold', () => {
    // Above $197,300 for single — no QBI in this lightweight version
    expect(calcQBIDeduction(200000, 'single')).toBe(0);
  });

  it('applies correct threshold for MFJ', () => {
    // $394,600 threshold for MFJ — just at threshold should still qualify
    expect(calcQBIDeduction(394600, 'mfj')).toBeGreaterThan(0);
    expect(calcQBIDeduction(400000, 'mfj')).toBe(0);
  });
});

describe('calcTaxSavings', () => {
  it('returns non-negative savings', () => {
    const result = calcTaxSavings(80000, 'single', 0);
    expect(result.totalSavings).toBeGreaterThanOrEqual(0);
  });

  it('reference scenario: single filer $80k income, no dependents', () => {
    // Validated against IRS 2025 tables and published SE calculators:
    // Net SE income: $80,000 * 0.9235 = $73,880
    // SE tax: $73,880 * 0.153 = ~$11,303.64
    // SE deduction: $11,303.64 * 0.5 = ~$5,651.82
    // QBI deduction: $73,880 * 0.2 = ~$14,776 (net SE income as QBI base)
    // Taxable income (with deductions): $80,000 - $5,651.82 - $14,776 - $15,000 = ~$44,572.18
    // Federal income tax with deductions: ~$4,948
    // Taxable income (without deductions): $80,000 - $15,000 = $65,000
    // Federal income tax without deductions: ~$9,261
    // Total savings = income tax saved + SE deduction value
    const result = calcTaxSavings(80000, 'single', 0);
    expect(result.seTax).toBeCloseTo(11303, 0);
    expect(result.seDeduction).toBeCloseTo(5652, 0);
    expect(result.qbiDeduction).toBeCloseTo(14776, 0);
    expect(result.totalSavings).toBeGreaterThan(3000);
    expect(result.totalSavings).toBeLessThan(8000);
  });

  it('produces higher savings for MFJ than single at same income', () => {
    const single = calcTaxSavings(150000, 'single', 0);
    const mfj = calcTaxSavings(150000, 'mfj', 0);
    // MFJ has higher standard deduction and wider brackets
    expect(mfj.federalIncomeTaxWithDeductions).toBeLessThan(
      single.federalIncomeTaxWithDeductions
    );
  });
});
