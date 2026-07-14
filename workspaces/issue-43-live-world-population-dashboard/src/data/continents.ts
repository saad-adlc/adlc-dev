export const BASELINE_MS = new Date('2026-06-22T00:00:00Z').getTime();
export const SECONDS_PER_YEAR = 31_557_600;

export interface ContinentData {
  name: string;
  baseline: number;
  annualRatePct: number;
  sharePct: number;
}

export const CONTINENTS: ContinentData[] = [
  { name: 'Asia',          baseline: 4_863_327_397, annualRatePct:  0.58, sharePct: 58.6 },
  { name: 'Africa',        baseline: 1_584_985_259, annualRatePct:  2.27, sharePct: 19.1 },
  { name: 'Europe',        baseline:   743_482_361, annualRatePct: -0.12, sharePct:  9.0 },
  { name: 'North America', baseline:   621_247_959, annualRatePct:  0.64, sharePct:  7.5 },
  { name: 'South America', baseline:   440_484_603, annualRatePct:  0.54, sharePct:  5.3 },
  { name: 'Oceania',       baseline:    47_118_993, annualRatePct:  1.09, sharePct:  0.6 },
];

export const WORLD_BASELINE = CONTINENTS.reduce((sum, c) => sum + c.baseline, 0);
