import { BASELINE_MS, CONTINENTS, SECONDS_PER_YEAR } from '../data/continents';

export interface ContinentSnapshot {
  name: string;
  population: number;
  annualRatePct: number;
  sharePct: number;
}

export function computePopulation(baseline: number, annualRatePct: number, elapsedSeconds: number): number {
  const perSecond = (baseline * annualRatePct) / 100 / SECONDS_PER_YEAR;
  return Math.round(baseline + perSecond * elapsedSeconds);
}

export function getElapsedSeconds(nowMs: number): number {
  return (nowMs - BASELINE_MS) / 1000;
}

export function computeContinentPopulations(elapsedSeconds: number): ContinentSnapshot[] {
  return CONTINENTS.map(c => ({
    name: c.name,
    population: computePopulation(c.baseline, c.annualRatePct, elapsedSeconds),
    annualRatePct: c.annualRatePct,
    sharePct: c.sharePct,
  }));
}

export function computeWorldTotal(continents: ContinentSnapshot[]): number {
  return continents.reduce((sum, c) => sum + c.population, 0);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}
