/** 2025 CPP employee contribution parameters. */
const CPP_RATE = 0.0595;
const CPP_MAX_PENSIONABLE = 73_200;
const CPP_BASIC_EXEMPTION = 3_500;
const CPP_MAX_CONTRIBUTION = 4_145.5;

/** 2025 EI employee premium parameters. */
const EI_RATE = 0.0164;
const EI_MAX_INSURABLE = 65_700;
const EI_MAX_PREMIUM = 1_077.48;

/** 2025 Federal basic personal amount. */
const FEDERAL_BPA = 16_129;

/** 2025 Ontario basic personal amount. */
const ONTARIO_BPA = 11_865;

/** Weeks per year (gross derivation from hourly). */
export const WEEKS_PER_YEAR = 52;

/** Pay periods per year (biweekly). */
const PAY_PERIODS = 26;

/** Months per year. */
const MONTHS_PER_YEAR = 12;

interface Bracket {
  lower: number;
  upper: number;
  rate: number;
}

/** 2025 Federal income tax brackets. */
const FEDERAL_BRACKETS: Bracket[] = [
  { lower: 0, upper: 57_375, rate: 0.15 },
  { lower: 57_375, upper: 114_750, rate: 0.205 },
  { lower: 114_750, upper: 158_519, rate: 0.26 },
  { lower: 158_519, upper: 220_000, rate: 0.29 },
  { lower: 220_000, upper: Infinity, rate: 0.33 },
];

/** 2025 Ontario provincial income tax brackets. */
const ONTARIO_BRACKETS: Bracket[] = [
  { lower: 0, upper: 51_446, rate: 0.0505 },
  { lower: 51_446, upper: 102_894, rate: 0.0915 },
  { lower: 102_894, upper: 150_000, rate: 0.1116 },
  { lower: 150_000, upper: 220_000, rate: 0.1216 },
  { lower: 220_000, upper: Infinity, rate: 0.1316 },
];

export interface BracketDetail {
  lower: number;
  /** null for the top (uncapped) bracket. */
  upper: number | null;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export interface TaxBreakdown {
  brackets: BracketDetail[];
  totalTax: number;
}

export interface TaxResult {
  gross: number;
  cpp: number;
  ei: number;
  federalTax: TaxBreakdown;
  provincialTax: TaxBreakdown;
  totalDeductions: number;
  netAnnual: number;
  netMonthly: number;
  netPerPaycheque: number;
}

/**
 * Derive annual gross income from hourly inputs.
 * @param rate Hourly pay rate in dollars.
 * @param hoursPerWeek Hours worked per week.
 */
export function calculateGrossFromHourly(rate: number, hoursPerWeek: number): number {
  return rate * hoursPerWeek * WEEKS_PER_YEAR;
}

/**
 * Calculate 2025 CPP employee contribution.
 * @param gross Annual gross income.
 */
export function calculateCpp(gross: number): number {
  const pensionable = Math.min(gross, CPP_MAX_PENSIONABLE) - CPP_BASIC_EXEMPTION;
  if (pensionable <= 0) return 0;
  return Math.min(pensionable * CPP_RATE, CPP_MAX_CONTRIBUTION);
}

/**
 * Calculate 2025 EI employee premium.
 * @param gross Annual gross income.
 */
export function calculateEi(gross: number): number {
  const insurable = Math.min(gross, EI_MAX_INSURABLE);
  return Math.min(insurable * EI_RATE, EI_MAX_PREMIUM);
}

function applyBrackets(taxable: number, brackets: Bracket[]): BracketDetail[] {
  return brackets.map(({ lower, upper, rate }) => {
    const taxableAmount = Math.max(0, Math.min(taxable, upper) - lower);
    return {
      lower,
      upper: upper === Infinity ? null : upper,
      rate,
      taxableAmount,
      tax: taxableAmount * rate,
    };
  });
}

/**
 * Calculate 2025 federal income tax with per-bracket detail.
 * Applies the federal basic personal amount before bracket calculation.
 * @param gross Annual gross income.
 */
export function calculateFederalTax(gross: number): TaxBreakdown {
  const taxable = Math.max(0, gross - FEDERAL_BPA);
  const brackets = applyBrackets(taxable, FEDERAL_BRACKETS);
  return { brackets, totalTax: brackets.reduce((sum, b) => sum + b.tax, 0) };
}

/**
 * Calculate 2025 Ontario provincial income tax with per-bracket detail.
 * Applies the Ontario basic personal amount before bracket calculation.
 * @param gross Annual gross income.
 */
export function calculateOntarioTax(gross: number): TaxBreakdown {
  const taxable = Math.max(0, gross - ONTARIO_BPA);
  const brackets = applyBrackets(taxable, ONTARIO_BRACKETS);
  return { brackets, totalTax: brackets.reduce((sum, b) => sum + b.tax, 0) };
}

/**
 * Run all deduction and tax calculations for a given annual gross income.
 * @param gross Annual gross income.
 */
export function calculateTaxResult(gross: number): TaxResult {
  const cpp = calculateCpp(gross);
  const ei = calculateEi(gross);
  const federalTax = calculateFederalTax(gross);
  const provincialTax = calculateOntarioTax(gross);
  const totalDeductions = cpp + ei + federalTax.totalTax + provincialTax.totalTax;
  const netAnnual = gross - totalDeductions;
  return {
    gross,
    cpp,
    ei,
    federalTax,
    provincialTax,
    totalDeductions,
    netAnnual,
    netMonthly: netAnnual / MONTHS_PER_YEAR,
    netPerPaycheque: netAnnual / PAY_PERIODS,
  };
}
