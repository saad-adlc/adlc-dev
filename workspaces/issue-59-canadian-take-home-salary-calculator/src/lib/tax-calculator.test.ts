import {
  calculateFederalTax,
  calculateOntarioTax,
  calculateCPP,
  calculateEI,
  calculateTakeHome,
} from './tax-calculator';

describe('calculateFederalTax', () => {
  it('returns zero tax for zero income', () => {
    const { tax } = calculateFederalTax(0);
    expect(tax).toBe(0);
  });

  it('returns zero tax when income is below the Basic Personal Amount', () => {
    const { tax } = calculateFederalTax(10000);
    // Gross: 10000 × 15% = 1500; BPA credit: 15705 × 15% = 2355.75 → capped at 1500 → net = 0
    expect(tax).toBe(0);
  });

  it('calculates first-bracket federal tax correctly', () => {
    const { tax } = calculateFederalTax(50000);
    // Gross: 50000 × 15% = 7500; BPA credit: 2355.75; Net: 5144.25
    expect(tax).toBeCloseTo(5144.25, 1);
  });

  it('calculates multi-bracket federal tax correctly', () => {
    const { tax } = calculateFederalTax(200000);
    const expected =
      55867 * 0.15 +
      (111733 - 55867) * 0.205 +
      (154906 - 111733) * 0.26 +
      (200000 - 154906) * 0.29 -
      15705 * 0.15;
    expect(tax).toBeCloseTo(expected, 1);
  });

  it('includes a negative BPA credit row in details for taxable income', () => {
    const { details } = calculateFederalTax(60000);
    const credit = details.find(d => d.bracket === 'Basic Personal Amount' && d.type === 'Federal');
    expect(credit).toBeDefined();
    expect(credit!.amount).toBeLessThan(0);
  });

  it('produces Federal-type detail rows for each applicable bracket', () => {
    const { details } = calculateFederalTax(120000);
    const bracketRows = details.filter(d => d.type === 'Federal' && d.amount > 0);
    expect(bracketRows.length).toBeGreaterThanOrEqual(2);
  });
});

describe('calculateOntarioTax', () => {
  it('returns zero tax for zero income', () => {
    const { tax } = calculateOntarioTax(0);
    expect(tax).toBe(0);
  });

  it('calculates Ontario first-bracket tax correctly', () => {
    const { tax } = calculateOntarioTax(50000);
    // Gross: 50000 × 5.05% = 2525; BPA credit: 11865 × 5.05% = 599.18; Net: 1925.82
    expect(tax).toBeCloseTo(1925.82, 1);
  });

  it('calculates multi-bracket Ontario tax correctly', () => {
    const { tax } = calculateOntarioTax(120000);
    const expected =
      51446 * 0.0505 +
      (102894 - 51446) * 0.0915 +
      (120000 - 102894) * 0.1116 -
      11865 * 0.0505;
    expect(tax).toBeCloseTo(expected, 1);
  });

  it('includes a negative Ontario BPA credit row in details', () => {
    const { details } = calculateOntarioTax(60000);
    const credit = details.find(d => d.bracket === 'Basic Personal Amount' && d.type === 'Ontario');
    expect(credit).toBeDefined();
    expect(credit!.amount).toBeLessThan(0);
  });
});

describe('calculateCPP', () => {
  it('returns zero for zero income', () => {
    expect(calculateCPP(0)).toBe(0);
  });

  it('returns zero when income is below the basic exemption', () => {
    expect(calculateCPP(2000)).toBe(0);
  });

  it('calculates CPP correctly for income above the exemption', () => {
    // (10000 - 3500) × 5.95% = 6500 × 5.95% = 386.75
    expect(calculateCPP(10000)).toBeCloseTo(386.75, 2);
  });

  it('caps CPP at the maximum annual contribution', () => {
    // (68500 - 3500) × 5.95% = 65000 × 5.95% = 3867.50
    expect(calculateCPP(100000)).toBeCloseTo(3867.5, 2);
  });

  it('reaches the cap exactly at maximum pensionable earnings', () => {
    expect(calculateCPP(68500)).toBeCloseTo(3867.5, 2);
  });
});

describe('calculateEI', () => {
  it('returns zero for zero income', () => {
    expect(calculateEI(0)).toBe(0);
  });

  it('calculates EI for income below the maximum insurable', () => {
    // 50000 × 1.66% = 830
    expect(calculateEI(50000)).toBeCloseTo(830, 1);
  });

  it('caps EI at maximum insurable earnings', () => {
    // 63200 × 1.66% = 1049.12
    expect(calculateEI(100000)).toBeCloseTo(1049.12, 2);
  });

  it('reaches the cap exactly at maximum insurable earnings', () => {
    expect(calculateEI(63200)).toBeCloseTo(1049.12, 2);
  });
});

describe('calculateTakeHome', () => {
  it('returns zero take-home for zero income', () => {
    const result = calculateTakeHome(0);
    expect(result.takeHomeYearly).toBe(0);
    expect(result.takeHomeMonthly).toBe(0);
    expect(result.takeHomeHourly).toBe(0);
  });

  it('effective tax rate is zero for zero income', () => {
    expect(calculateTakeHome(0).effectiveTaxRate).toBe(0);
  });

  it('take-home monthly equals yearly divided by 12', () => {
    const result = calculateTakeHome(60000);
    expect(result.takeHomeMonthly).toBeCloseTo(result.takeHomeYearly / 12, 5);
  });

  it('take-home hourly equals yearly divided by 2080', () => {
    const result = calculateTakeHome(60000);
    expect(result.takeHomeHourly).toBeCloseTo(result.takeHomeYearly / 2080, 5);
  });

  it('effective tax rate equals total deductions divided by gross', () => {
    const result = calculateTakeHome(80000);
    expect(result.effectiveTaxRate).toBeCloseTo(result.totalDeductions / result.grossYearly, 5);
  });

  it('total deductions equal federal + provincial + CPP + EI', () => {
    const result = calculateTakeHome(60000);
    const sum = result.federalTax + result.provincialTax + result.cpp + result.ei;
    expect(result.totalDeductions).toBeCloseTo(sum, 5);
  });

  it('take-home yearly equals gross minus total deductions', () => {
    const result = calculateTakeHome(60000);
    expect(result.takeHomeYearly).toBeCloseTo(result.grossYearly - result.totalDeductions, 5);
  });

  it('breakdown contains Federal, Ontario, CPP, and EI rows', () => {
    const result = calculateTakeHome(60000);
    expect(result.breakdown.some(d => d.type === 'Federal')).toBe(true);
    expect(result.breakdown.some(d => d.type === 'Ontario')).toBe(true);
    expect(result.breakdown.some(d => d.type === 'CPP')).toBe(true);
    expect(result.breakdown.some(d => d.type === 'EI')).toBe(true);
  });

  it('grossYearly matches the input', () => {
    const result = calculateTakeHome(75000);
    expect(result.grossYearly).toBe(75000);
  });
});
