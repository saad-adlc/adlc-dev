import { describe, it, expect } from 'vitest';
import {
  computePopulation,
  computeContinentPopulations,
  computeWorldTotal,
  formatNumber,
  getElapsedSeconds,
} from './population';
import { BASELINE_MS, CONTINENTS, SECONDS_PER_YEAR, WORLD_BASELINE } from '../data/continents';

describe('computePopulation', () => {
  it('returns baseline when elapsed seconds is 0', () => {
    expect(computePopulation(1_000_000, 1.0, 0)).toBe(1_000_000);
  });

  it('increases for positive growth rate', () => {
    const after = computePopulation(1_000_000, 1.0, SECONDS_PER_YEAR);
    expect(after).toBeGreaterThan(1_000_000);
    expect(after).toBeCloseTo(1_010_000, -2);
  });

  it('decreases for negative growth rate', () => {
    const after = computePopulation(1_000_000, -0.12, SECONDS_PER_YEAR);
    expect(after).toBeLessThan(1_000_000);
  });

  it('is linear: two years = twice the one-year delta', () => {
    const deltaOne = computePopulation(1_000_000, 0.5, SECONDS_PER_YEAR) - 1_000_000;
    const deltaTwo = computePopulation(1_000_000, 0.5, 2 * SECONDS_PER_YEAR) - 1_000_000;
    expect(deltaTwo).toBeCloseTo(2 * deltaOne, 0);
  });
});

describe('Europe negative growth', () => {
  it('Europe population decreases after one year', () => {
    const europe = CONTINENTS.find(c => c.name === 'Europe')!;
    const pop0 = computePopulation(europe.baseline, europe.annualRatePct, 0);
    const pop1yr = computePopulation(europe.baseline, europe.annualRatePct, SECONDS_PER_YEAR);
    expect(pop1yr).toBeLessThan(pop0);
  });
});

describe('formatNumber', () => {
  it('adds thousands separators (result differs from raw string)', () => {
    const formatted = formatNumber(8_300_646_572);
    expect(formatted).not.toBe('8300646572');
    expect(formatted.replace(/[^0-9]/g, '')).toBe('8300646572');
  });

  it('formats zero as "0"', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('world total invariant', () => {
  it('WORLD_BASELINE equals sum of continent baselines', () => {
    const sum = CONTINENTS.reduce((s, c) => s + c.baseline, 0);
    expect(sum).toBe(WORLD_BASELINE);
    expect(WORLD_BASELINE).toBe(8_300_646_572);
  });

  it('computeWorldTotal equals sum of continent populations at t=0', () => {
    const continents = computeContinentPopulations(0);
    const worldTotal = computeWorldTotal(continents);
    const manualSum = continents.reduce((s, c) => s + c.population, 0);
    expect(worldTotal).toBe(manualSum);
  });

  it('computeWorldTotal equals sum of continent populations at t=3600s', () => {
    const continents = computeContinentPopulations(3600);
    const worldTotal = computeWorldTotal(continents);
    const manualSum = continents.reduce((s, c) => s + c.population, 0);
    expect(worldTotal).toBe(manualSum);
  });
});

describe('getElapsedSeconds', () => {
  it('returns 0 at baseline time', () => {
    expect(getElapsedSeconds(BASELINE_MS)).toBe(0);
  });

  it('returns positive seconds after baseline', () => {
    expect(getElapsedSeconds(BASELINE_MS + 5000)).toBe(5);
  });
});

describe('computeContinentPopulations', () => {
  it('returns six continents', () => {
    const result = computeContinentPopulations(0);
    expect(result).toHaveLength(6);
  });

  it('first continent is Asia', () => {
    const result = computeContinentPopulations(0);
    expect(result[0].name).toBe('Asia');
  });

  it('last continent is Oceania', () => {
    const result = computeContinentPopulations(0);
    expect(result[5].name).toBe('Oceania');
  });

  it('passes through annualRatePct and sharePct', () => {
    const result = computeContinentPopulations(0);
    const europe = result.find(c => c.name === 'Europe')!;
    expect(europe.annualRatePct).toBe(-0.12);
    expect(europe.sharePct).toBe(9.0);
  });
});
