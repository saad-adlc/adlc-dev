import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculateGdsRatio,
  calculateApprovalLikelihood,
  getVerdict,
  buildExplanation,
  validateInputs,
  runAffordabilityCheck,
} from './mortgage-calculator';

describe('calculateMonthlyPayment', () => {
  it('returns 0 for a loan amount of 0', () => {
    expect(calculateMonthlyPayment(0)).toBe(0);
  });

  it('returns 0 for a negative loan amount', () => {
    expect(calculateMonthlyPayment(-1000)).toBe(0);
  });

  it('calculates payment for $400,000 at 5% over 25 years', () => {
    const payment = calculateMonthlyPayment(400_000);
    expect(payment).toBeGreaterThan(2300);
    expect(payment).toBeLessThan(2400);
  });

  it('is proportional to the loan amount', () => {
    const p1 = calculateMonthlyPayment(200_000);
    const p2 = calculateMonthlyPayment(400_000);
    expect(p2).toBeCloseTo(p1 * 2, 5);
  });
});

describe('calculateGdsRatio', () => {
  it('returns 0.30 when payment is exactly 30% of monthly income', () => {
    // $1,500 payment / ($60,000 / 12 = $5,000) = 0.30
    expect(calculateGdsRatio(1500, 60_000)).toBeCloseTo(0.3, 5);
  });

  it('returns a ratio greater than 1 when payment exceeds monthly income', () => {
    expect(calculateGdsRatio(6000, 60_000)).toBeCloseTo(1.2, 5);
  });

  it('returns a small ratio for very high income', () => {
    expect(calculateGdsRatio(1000, 1_200_000)).toBeCloseTo(0.01, 5);
  });
});

describe('calculateApprovalLikelihood', () => {
  it('returns 0 for credit score 599', () => {
    expect(calculateApprovalLikelihood(1500, 60_000, 599)).toBe(0);
  });

  it('returns 0 for credit score 300 (scale minimum)', () => {
    expect(calculateApprovalLikelihood(1500, 60_000, 300)).toBe(0);
  });

  it('returns higher likelihood for higher credit scores', () => {
    const low = calculateApprovalLikelihood(1500, 60_000, 650);
    const high = calculateApprovalLikelihood(1500, 60_000, 850);
    expect(high).toBeGreaterThan(low);
  });

  it('returns lower likelihood when GDS exceeds the 30% threshold', () => {
    const passes = calculateApprovalLikelihood(1500, 60_000, 750); // GDS = 30%
    const fails = calculateApprovalLikelihood(2500, 60_000, 750);  // GDS = 50%
    expect(passes).toBeGreaterThan(fails);
  });

  it('caps likelihood at 100', () => {
    const likelihood = calculateApprovalLikelihood(100, 1_000_000, 900);
    expect(likelihood).toBeLessThanOrEqual(100);
  });

  it('returns a non-negative value', () => {
    expect(calculateApprovalLikelihood(100_000, 60_000, 700)).toBeGreaterThanOrEqual(0);
  });

  it('returns 50 for score 600 with GDS exactly at the 30% threshold', () => {
    // creditFactor = (600-300)/600 = 0.5; affordabilityScore = 1.0 → 50
    const monthly = (60_000 / 12) * 0.3; // exactly 30%
    expect(calculateApprovalLikelihood(monthly, 60_000, 600)).toBe(50);
  });

  it('returns 100 for score 900 with GDS well below threshold', () => {
    // creditFactor = 1.0; affordabilityScore capped at 1.0 → 100
    const monthly = (120_000 / 12) * 0.1; // 10% GDS
    expect(calculateApprovalLikelihood(monthly, 120_000, 900)).toBe(100);
  });
});

describe('getVerdict', () => {
  it('returns Not eligible for credit score below 600', () => {
    expect(getVerdict(90, 599)).toBe('Not eligible');
    expect(getVerdict(0, 300)).toBe('Not eligible');
  });

  it('returns Likely approved for likelihood >= 75', () => {
    expect(getVerdict(75, 700)).toBe('Likely approved');
    expect(getVerdict(100, 900)).toBe('Likely approved');
  });

  it('returns Borderline for likelihood 50–74', () => {
    expect(getVerdict(50, 700)).toBe('Borderline');
    expect(getVerdict(74, 700)).toBe('Borderline');
  });

  it('returns Unlikely for likelihood below 50', () => {
    expect(getVerdict(49, 700)).toBe('Unlikely');
    expect(getVerdict(0, 700)).toBe('Unlikely');
  });
});

describe('buildExplanation', () => {
  it('says "below" when GDS ratio is under 30%', () => {
    const text = buildExplanation(0.25, 750);
    expect(text).toContain('below');
    expect(text).toContain('30%');
  });

  it('says "above" when GDS ratio exceeds 30%', () => {
    const text = buildExplanation(0.45, 750);
    expect(text).toContain('above');
    expect(text).toContain('30%');
  });

  it('says "below the minimum 600 requirement" for scores below 600', () => {
    const text = buildExplanation(0.25, 580);
    expect(text).toContain('below the minimum 600 requirement');
  });

  it('says "meets the minimum requirement" for scores of 600 or above', () => {
    const text = buildExplanation(0.25, 700);
    expect(text).toContain('meets the minimum requirement');
  });

  it('includes the GDS percentage rounded to the nearest whole number', () => {
    const text = buildExplanation(0.333, 750);
    expect(text).toContain('33%');
  });
});

describe('validateInputs', () => {
  it('returns no errors for valid inputs', () => {
    const errors = validateInputs(500_000, 100_000, 120_000, 720);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('allows a down payment of 0', () => {
    const errors = validateInputs(500_000, 0, 120_000, 720);
    expect(errors.downPayment).toBeUndefined();
  });

  it('reports an error for house value of 0', () => {
    expect(validateInputs(0, 0, 120_000, 700).houseValue).toBeTruthy();
  });

  it('reports an error for negative house value', () => {
    expect(validateInputs(-1, 0, 120_000, 700).houseValue).toBeTruthy();
  });

  it('reports an error for NaN house value', () => {
    expect(validateInputs(NaN, 0, 120_000, 700).houseValue).toBeTruthy();
  });

  it('reports an error for negative down payment', () => {
    expect(validateInputs(500_000, -1, 120_000, 700).downPayment).toBeTruthy();
  });

  it('reports an error when down payment equals house value', () => {
    expect(validateInputs(300_000, 300_000, 120_000, 700).downPayment).toBeTruthy();
  });

  it('reports an error when down payment exceeds house value', () => {
    expect(validateInputs(300_000, 400_000, 120_000, 700).downPayment).toBeTruthy();
  });

  it('reports an error for NaN down payment', () => {
    expect(validateInputs(500_000, NaN, 120_000, 700).downPayment).toBeTruthy();
  });

  it('reports an error for annual income of 0', () => {
    expect(validateInputs(500_000, 0, 0, 700).annualIncome).toBeTruthy();
  });

  it('reports an error for negative annual income', () => {
    expect(validateInputs(500_000, 0, -1, 700).annualIncome).toBeTruthy();
  });

  it('reports an error for NaN annual income', () => {
    expect(validateInputs(500_000, 0, NaN, 700).annualIncome).toBeTruthy();
  });

  it('reports an error for credit score below 300', () => {
    expect(validateInputs(500_000, 0, 120_000, 299).creditScore).toBeTruthy();
  });

  it('reports an error for credit score above 900', () => {
    expect(validateInputs(500_000, 0, 120_000, 901).creditScore).toBeTruthy();
  });

  it('reports an error for NaN credit score', () => {
    expect(validateInputs(500_000, 0, 120_000, NaN).creditScore).toBeTruthy();
  });

  it('allows credit score of exactly 300', () => {
    expect(validateInputs(500_000, 0, 120_000, 300).creditScore).toBeUndefined();
  });

  it('allows credit score of exactly 900', () => {
    expect(validateInputs(500_000, 0, 120_000, 900).creditScore).toBeUndefined();
  });
});

describe('runAffordabilityCheck', () => {
  it('returns all required result fields', () => {
    const result = runAffordabilityCheck(500_000, 100_000, 120_000, 750);
    expect(result).toHaveProperty('likelihood');
    expect(result).toHaveProperty('monthlyPayment');
    expect(result).toHaveProperty('gdsRatio');
    expect(result).toHaveProperty('verdict');
    expect(result).toHaveProperty('explanation');
  });

  it('returns 0% likelihood and Not eligible for credit score below 600', () => {
    const result = runAffordabilityCheck(500_000, 100_000, 120_000, 550);
    expect(result.likelihood).toBe(0);
    expect(result.verdict).toBe('Not eligible');
  });

  it('returns a positive monthly payment', () => {
    const result = runAffordabilityCheck(500_000, 100_000, 120_000, 750);
    expect(result.monthlyPayment).toBeGreaterThan(0);
  });

  it('computes GDS ratio from calculated monthly payment', () => {
    const result = runAffordabilityCheck(500_000, 100_000, 120_000, 750);
    expect(result.gdsRatio).toBeGreaterThan(0);
  });
});
