/**
 * 2025 US Federal Tax Constants
 * Source: IRS Rev. Proc. 2024-40 (2025 inflation adjustments)
 */

/** Filing status options for the calculator */
export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh';

/** Standard deduction amounts by filing status (2025) */
export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 15000,
  mfj: 30000,
  mfs: 15000,
  hoh: 22500,
};

/** Self-employment tax rate (Social Security + Medicare) */
export const SE_TAX_RATE = 0.153;

/** SE income subject to SE tax (92.35% of net SE income) */
export const SE_INCOME_FACTOR = 0.9235;

/** Fraction of SE tax that is deductible from gross income */
export const SE_TAX_DEDUCTIBLE_FRACTION = 0.5;

/** QBI deduction rate (Qualified Business Income, Section 199A) */
export const QBI_RATE = 0.2;

/**
 * 2025 QBI thresholds — above these, phase-out begins.
 * For simplicity in this lightweight calculator we apply the full
 * 20% deduction below the threshold and zero above (no phase-out interpolation).
 */
export const QBI_THRESHOLD: Record<FilingStatus, number> = {
  single: 197300,
  mfj: 394600,
  mfs: 197300,
  hoh: 197300,
};

/** Social Security wage base for 2025 (only this portion subject to 12.4% SS tax) */
export const SS_WAGE_BASE = 176100;

/**
 * 2025 federal income tax brackets.
 * Each bracket: [rate, upper income limit] — last entry has Infinity as the upper limit.
 * Amounts are taxable-income thresholds (not marginal amounts).
 */
export interface TaxBracket {
  rate: number;
  upTo: number;
}

export const TAX_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.10, upTo: 11925 },
    { rate: 0.12, upTo: 48475 },
    { rate: 0.22, upTo: 103350 },
    { rate: 0.24, upTo: 197300 },
    { rate: 0.32, upTo: 250525 },
    { rate: 0.35, upTo: 626350 },
    { rate: 0.37, upTo: Infinity },
  ],
  mfj: [
    { rate: 0.10, upTo: 23850 },
    { rate: 0.12, upTo: 96950 },
    { rate: 0.22, upTo: 206700 },
    { rate: 0.24, upTo: 394600 },
    { rate: 0.32, upTo: 501050 },
    { rate: 0.35, upTo: 751600 },
    { rate: 0.37, upTo: Infinity },
  ],
  mfs: [
    { rate: 0.10, upTo: 11925 },
    { rate: 0.12, upTo: 48475 },
    { rate: 0.22, upTo: 103350 },
    { rate: 0.24, upTo: 197300 },
    { rate: 0.32, upTo: 250525 },
    { rate: 0.35, upTo: 375800 },
    { rate: 0.37, upTo: Infinity },
  ],
  hoh: [
    { rate: 0.10, upTo: 17000 },
    { rate: 0.12, upTo: 64850 },
    { rate: 0.22, upTo: 103350 },
    { rate: 0.24, upTo: 197300 },
    { rate: 0.32, upTo: 250500 },
    { rate: 0.35, upTo: 626350 },
    { rate: 0.37, upTo: Infinity },
  ],
};
