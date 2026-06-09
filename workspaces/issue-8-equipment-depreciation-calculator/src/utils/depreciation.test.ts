import { validateInputs, calcStraightLine, calcDecliningBalance } from './depreciation';

describe('validateInputs', () => {
  it('returns null for valid inputs', () => {
    expect(validateInputs(10000, 1000, 5)).toBeNull();
  });

  it('returns null when salvage is 0', () => {
    expect(validateInputs(5000, 0, 10)).toBeNull();
  });

  it('returns error for zero cost', () => {
    expect(validateInputs(0, 0, 5)).not.toBeNull();
  });

  it('returns error for negative cost', () => {
    expect(validateInputs(-100, 0, 5)).not.toBeNull();
  });

  it('returns error for NaN cost', () => {
    expect(validateInputs(NaN, 0, 5)).not.toBeNull();
  });

  it('returns error for Infinity cost', () => {
    expect(validateInputs(Infinity, 0, 5)).not.toBeNull();
  });

  it('returns error for negative salvage', () => {
    expect(validateInputs(10000, -100, 5)).not.toBeNull();
  });

  it('returns error for NaN salvage', () => {
    expect(validateInputs(10000, NaN, 5)).not.toBeNull();
  });

  it('returns error when salvage equals cost', () => {
    expect(validateInputs(10000, 10000, 5)).not.toBeNull();
  });

  it('returns error when salvage exceeds cost', () => {
    expect(validateInputs(10000, 15000, 5)).not.toBeNull();
  });

  it('returns error for zero life', () => {
    expect(validateInputs(10000, 0, 0)).not.toBeNull();
  });

  it('returns error for negative life', () => {
    expect(validateInputs(10000, 0, -1)).not.toBeNull();
  });

  it('returns error for fractional life', () => {
    expect(validateInputs(10000, 0, 2.5)).not.toBeNull();
  });

  it('returns error for NaN life', () => {
    expect(validateInputs(10000, 0, NaN)).not.toBeNull();
  });
});

describe('calcStraightLine', () => {
  it('returns correct number of rows', () => {
    expect(calcStraightLine(10000, 1000, 5)).toHaveLength(5);
  });

  it('assigns sequential year numbers', () => {
    const rows = calcStraightLine(10000, 0, 3);
    expect(rows.map(r => r.year)).toEqual([1, 2, 3]);
  });

  it('calculates equal annual depreciation every year', () => {
    const rows = calcStraightLine(10000, 1000, 5);
    const expected = (10000 - 1000) / 5;
    rows.forEach(row => expect(row.annualDepreciation).toBeCloseTo(expected));
  });

  it('accumulated depreciation grows cumulatively', () => {
    const rows = calcStraightLine(10000, 1000, 3);
    const annual = rows[0].annualDepreciation;
    expect(rows[0].accumulatedDepreciation).toBeCloseTo(annual);
    expect(rows[1].accumulatedDepreciation).toBeCloseTo(annual * 2);
    expect(rows[2].accumulatedDepreciation).toBeCloseTo(annual * 3);
  });

  it('book value decreases each year', () => {
    const rows = calcStraightLine(10000, 0, 5);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].bookValue).toBeLessThan(rows[i - 1].bookValue);
    }
  });

  it('final year book value equals salvage', () => {
    const rows = calcStraightLine(10000, 1000, 5);
    expect(rows[rows.length - 1].bookValue).toBeCloseTo(1000);
  });

  it('final year book value equals salvage when salvage is 0', () => {
    const rows = calcStraightLine(5000, 0, 10);
    expect(rows[rows.length - 1].bookValue).toBeCloseTo(0);
  });

  it('works for a single-year life', () => {
    const rows = calcStraightLine(5000, 500, 1);
    expect(rows).toHaveLength(1);
    expect(rows[0].annualDepreciation).toBeCloseTo(4500);
    expect(rows[0].bookValue).toBeCloseTo(500);
  });
});

describe('calcDecliningBalance', () => {
  it('returns correct number of rows', () => {
    expect(calcDecliningBalance(10000, 1000, 5)).toHaveLength(5);
  });

  it('assigns sequential year numbers', () => {
    const rows = calcDecliningBalance(10000, 0, 3);
    expect(rows.map(r => r.year)).toEqual([1, 2, 3]);
  });

  it('first year depreciation equals cost × rate', () => {
    const rows = calcDecliningBalance(10000, 1000, 5);
    expect(rows[0].annualDepreciation).toBeCloseTo(10000 * (2 / 5));
  });

  it('final year book value equals salvage (non-zero)', () => {
    const rows = calcDecliningBalance(10000, 1000, 5);
    expect(rows[rows.length - 1].bookValue).toBeCloseTo(1000);
  });

  it('final year book value equals salvage when salvage is 0', () => {
    const rows = calcDecliningBalance(5000, 0, 5);
    expect(rows[rows.length - 1].bookValue).toBeCloseTo(0);
  });

  it('book value never falls below salvage', () => {
    const rows = calcDecliningBalance(10000, 2000, 5);
    rows.forEach(row => expect(row.bookValue).toBeGreaterThanOrEqual(2000 - 0.001));
  });

  it('depreciation is never negative', () => {
    const rows = calcDecliningBalance(10000, 1000, 5);
    rows.forEach(row => expect(row.annualDepreciation).toBeGreaterThanOrEqual(0));
  });

  it('accumulated depreciation is cumulative', () => {
    const rows = calcDecliningBalance(10000, 0, 3);
    expect(rows[1].accumulatedDepreciation).toBeCloseTo(
      rows[0].annualDepreciation + rows[1].annualDepreciation,
    );
  });

  it('works for a single-year life', () => {
    const rows = calcDecliningBalance(5000, 500, 1);
    expect(rows).toHaveLength(1);
    expect(rows[0].bookValue).toBeCloseTo(500);
  });
});
