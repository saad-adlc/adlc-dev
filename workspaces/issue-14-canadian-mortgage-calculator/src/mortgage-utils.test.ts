import {
  calculateMonthlyRate,
  calculateMonthlyPayment,
  validateInputs,
  generateAmortizationSchedule,
  needsCmhcInsurance,
  formatCAD,
  PAYMENTS_PER_YEAR,
  MAX_RATE_PERCENT,
  MIN_TERM_YEARS,
  MAX_TERM_YEARS,
} from './mortgage-utils';

describe('calculateMonthlyRate', () => {
  it('applies the Canadian semi-annual compounding formula', () => {
    const rate = calculateMonthlyRate(5);
    const expected = Math.pow(1 + 0.05 / 2, 1 / 6) - 1;
    expect(rate).toBeCloseTo(expected, 10);
  });

  it('returns a positive rate for any positive annual rate', () => {
    expect(calculateMonthlyRate(1)).toBeGreaterThan(0);
    expect(calculateMonthlyRate(10)).toBeGreaterThan(0);
    expect(calculateMonthlyRate(25)).toBeGreaterThan(0);
  });

  it('produces a larger monthly rate for a higher annual rate', () => {
    expect(calculateMonthlyRate(6)).toBeGreaterThan(calculateMonthlyRate(5));
  });
});

describe('calculateMonthlyPayment', () => {
  it('returns principal / n when rate is zero', () => {
    expect(calculateMonthlyPayment(120000, 0, 120)).toBeCloseTo(1000, 2);
  });

  it('produces a payment such that the balance reaches zero', () => {
    const monthlyRate = calculateMonthlyRate(5);
    const n = 300;
    const payment = calculateMonthlyPayment(400000, monthlyRate, n);
    let balance = 400000;
    for (let i = 0; i < n; i++) {
      const interest = balance * monthlyRate;
      balance = balance - (payment - interest);
    }
    expect(Math.abs(balance)).toBeLessThan(0.01);
  });

  it('returns a higher payment for a larger principal', () => {
    const r = calculateMonthlyRate(5);
    expect(calculateMonthlyPayment(500000, r, 300)).toBeGreaterThan(
      calculateMonthlyPayment(400000, r, 300),
    );
  });

  it('returns a higher payment for a shorter term', () => {
    const r = calculateMonthlyRate(5);
    const principal = 400000;
    expect(calculateMonthlyPayment(principal, r, 180)).toBeGreaterThan(
      calculateMonthlyPayment(principal, r, 300),
    );
  });
});

describe('validateInputs', () => {
  const valid = { homePrice: 500000, downPayment: 100000, rate: 5, years: 25 };

  it('returns null for valid inputs', () => {
    expect(validateInputs(valid.homePrice, valid.downPayment, valid.rate, valid.years)).toBeNull();
  });

  it('errors when home price is zero', () => {
    const err = validateInputs(0, valid.downPayment, valid.rate, valid.years);
    expect(err).not.toBeNull();
    expect(err!.field).toBe('homePrice');
  });

  it('errors when home price is negative', () => {
    const err = validateInputs(-1, valid.downPayment, valid.rate, valid.years);
    expect(err).not.toBeNull();
    expect(err!.field).toBe('homePrice');
  });

  it('errors when home price is NaN', () => {
    const err = validateInputs(NaN, valid.downPayment, valid.rate, valid.years);
    expect(err).not.toBeNull();
    expect(err!.field).toBe('homePrice');
  });

  it('errors when down payment equals home price', () => {
    const err = validateInputs(500000, 500000, valid.rate, valid.years);
    expect(err).not.toBeNull();
    expect(err!.field).toBe('downPayment');
  });

  it('errors when down payment exceeds home price', () => {
    const err = validateInputs(500000, 600000, valid.rate, valid.years);
    expect(err).not.toBeNull();
    expect(err!.field).toBe('downPayment');
  });

  it('errors when down payment is negative', () => {
    const err = validateInputs(valid.homePrice, -1, valid.rate, valid.years);
    expect(err).not.toBeNull();
    expect(err!.field).toBe('downPayment');
  });

  it('errors when rate exceeds maximum', () => {
    const err = validateInputs(valid.homePrice, valid.downPayment, MAX_RATE_PERCENT + 0.01, valid.years);
    expect(err).not.toBeNull();
    expect(err!.field).toBe('rate');
  });

  it('errors when rate is zero', () => {
    const err = validateInputs(valid.homePrice, valid.downPayment, 0, valid.years);
    expect(err).not.toBeNull();
    expect(err!.field).toBe('rate');
  });

  it('accepts the maximum allowed rate', () => {
    expect(validateInputs(valid.homePrice, valid.downPayment, MAX_RATE_PERCENT, valid.years)).toBeNull();
  });

  it('errors when amortization is below minimum', () => {
    const err = validateInputs(valid.homePrice, valid.downPayment, valid.rate, MIN_TERM_YEARS - 1);
    expect(err).not.toBeNull();
    expect(err!.field).toBe('amortization');
  });

  it('errors when amortization exceeds maximum', () => {
    const err = validateInputs(valid.homePrice, valid.downPayment, valid.rate, MAX_TERM_YEARS + 1);
    expect(err).not.toBeNull();
    expect(err!.field).toBe('amortization');
  });

  it('accepts boundary amortization values', () => {
    expect(validateInputs(valid.homePrice, valid.downPayment, valid.rate, MIN_TERM_YEARS)).toBeNull();
    expect(validateInputs(valid.homePrice, valid.downPayment, valid.rate, MAX_TERM_YEARS)).toBeNull();
  });

  it('allows zero down payment', () => {
    expect(validateInputs(valid.homePrice, 0, valid.rate, valid.years)).toBeNull();
  });
});

describe('generateAmortizationSchedule', () => {
  const monthlyRate = calculateMonthlyRate(5);
  const principal = 400000;
  const years = 25;
  let schedule: ReturnType<typeof generateAmortizationSchedule>;

  beforeEach(() => {
    schedule = generateAmortizationSchedule(principal, monthlyRate, years);
  });

  it('produces one year summary per amortization year', () => {
    expect(schedule).toHaveLength(years);
  });

  it('produces 12 payment rows per year', () => {
    schedule.forEach(yr => expect(yr.rows).toHaveLength(PAYMENTS_PER_YEAR));
  });

  it('first payment interest = principal * monthlyRate', () => {
    const firstRow = schedule[0].rows[0];
    expect(firstRow.interest).toBeCloseTo(principal * monthlyRate, 2);
  });

  it('final balance is approximately zero', () => {
    const lastYear = schedule[schedule.length - 1];
    expect(lastYear.endingBalance).toBeCloseTo(0, 1);
  });

  it('year totals equal sum of monthly rows', () => {
    const yr = schedule[2];
    const rowInterestSum = yr.rows.reduce((s, r) => s + r.interest, 0);
    expect(yr.totalInterest).toBeCloseTo(rowInterestSum, 5);
  });

  it('payment numbers are sequential starting at 1', () => {
    expect(schedule[0].rows[0].paymentNumber).toBe(1);
    expect(schedule[0].rows[11].paymentNumber).toBe(12);
    expect(schedule[1].rows[0].paymentNumber).toBe(13);
  });

  it('balance decreases over time', () => {
    const firstBalance = schedule[0].rows[0].balance;
    const midBalance = schedule[12].rows[0].balance;
    expect(firstBalance).toBeGreaterThan(midBalance);
  });
});

describe('needsCmhcInsurance', () => {
  it('returns true when down payment is below 20%', () => {
    expect(needsCmhcInsurance(500000, 80000)).toBe(true);
  });

  it('returns false when down payment is exactly 20%', () => {
    expect(needsCmhcInsurance(500000, 100000)).toBe(false);
  });

  it('returns false when down payment exceeds 20%', () => {
    expect(needsCmhcInsurance(500000, 200000)).toBe(false);
  });

  it('returns false when home price is zero', () => {
    expect(needsCmhcInsurance(0, 0)).toBe(false);
  });

  it('returns true for zero down payment', () => {
    expect(needsCmhcInsurance(500000, 0)).toBe(true);
  });
});

describe('formatCAD', () => {
  it('includes the numeric value', () => {
    const result = formatCAD(500000);
    expect(result).toMatch(/500,000/);
  });

  it('includes two decimal places', () => {
    const result = formatCAD(1234.5);
    expect(result).toMatch(/1,234\.50/);
  });
});
