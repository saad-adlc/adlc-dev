import {
  FilingStatus,
  SE_TAX_RATE,
  SE_INCOME_FACTOR,
  SE_TAX_DEDUCTIBLE_FRACTION,
  QBI_RATE,
  QBI_THRESHOLD,
  SS_WAGE_BASE,
  STANDARD_DEDUCTION,
  TAX_BRACKETS,
} from '../constants/tax2025';

/** Result shape returned by calcTaxSavings */
export interface TaxSavingsResult {
  /** Gross self-employment income entered by user */
  grossIncome: number;
  /** Net SE income subject to SE tax (grossIncome * SE_INCOME_FACTOR) */
  netSEIncome: number;
  /** Total self-employment tax owed */
  seTax: number;
  /** Deductible portion of SE tax (50%) */
  seDeduction: number;
  /** Qualified Business Income deduction */
  qbiDeduction: number;
  /** Standard deduction for the filing status */
  standardDeduction: number;
  /** Taxable income after all deductions */
  taxableIncomeWithDeductions: number;
  /** Taxable income without SE-specific deductions (baseline) */
  taxableIncomeWithoutDeductions: number;
  /** Federal income tax after applying all deductions */
  federalIncomeTaxWithDeductions: number;
  /** Federal income tax with only the standard deduction (baseline) */
  federalIncomeTaxWithoutDeductions: number;
  /** Total dollar amount saved by applying SE deductions */
  totalSavings: number;
}

/**
 * Calculates the self-employment tax for a given gross income.
 * SE tax = (grossIncome * SE_INCOME_FACTOR) * SE_TAX_RATE
 * The Social Security portion (12.4%) is capped at SS_WAGE_BASE.
 * The Medicare portion (2.9%) applies to all net SE income.
 */
export function calcSETax(grossIncome: number): number {
  if (grossIncome <= 0) return 0;

  const netSEIncome = grossIncome * SE_INCOME_FACTOR;

  /** Social Security tax: 12.4% on income up to SS wage base */
  const ssTaxableIncome = Math.min(netSEIncome, SS_WAGE_BASE);
  const ssTax = ssTaxableIncome * 0.124;

  /** Medicare tax: 2.9% on all net SE income */
  const medicareTax = netSEIncome * 0.029;

  return ssTax + medicareTax;
}

/**
 * Calculates federal income tax using 2025 progressive brackets.
 * @param taxableIncome - income after all deductions (cannot be negative)
 * @param filingStatus - filing status determining brackets to use
 */
export function calcFederalIncomeTax(
  taxableIncome: number,
  filingStatus: FilingStatus
): number {
  if (taxableIncome <= 0) return 0;

  const brackets = TAX_BRACKETS[filingStatus];
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= previousLimit) break;

    const bracketIncome = Math.min(taxableIncome, bracket.upTo) - previousLimit;
    tax += bracketIncome * bracket.rate;
    previousLimit = bracket.upTo;
  }

  return tax;
}

/**
 * Calculates the Qualified Business Income (QBI) deduction (Section 199A).
 * Returns 20% of net SE income if income is below the 2025 threshold,
 * otherwise returns 0 (simplified — no phase-out interpolation in v1).
 * @param netSEIncome - net self-employment income (after SE_INCOME_FACTOR)
 * @param filingStatus - determines which QBI threshold applies
 */
export function calcQBIDeduction(
  netSEIncome: number,
  filingStatus: FilingStatus
): number {
  if (netSEIncome <= 0) return 0;

  const threshold = QBI_THRESHOLD[filingStatus];
  if (netSEIncome > threshold) return 0;

  return netSEIncome * QBI_RATE;
}

/**
 * Calculates total tax savings for a self-employed filer.
 * Compares tax with SE deductions vs. tax with only the standard deduction.
 * @param grossIncome - gross self-employment income
 * @param filingStatus - filing status
 * @param _dependents - collected for future use; does not affect v1 calculations
 */
export function calcTaxSavings(
  grossIncome: number,
  filingStatus: FilingStatus,
  _dependents: number
): TaxSavingsResult {
  const netSEIncome = grossIncome * SE_INCOME_FACTOR;
  const seTax = calcSETax(grossIncome);
  const seDeduction = seTax * SE_TAX_DEDUCTIBLE_FRACTION;
  const qbiDeduction = calcQBIDeduction(netSEIncome, filingStatus);
  const standardDeduction = STANDARD_DEDUCTION[filingStatus];

  /** Taxable income WITH SE deductions applied */
  const taxableIncomeWithDeductions = Math.max(
    0,
    grossIncome - seDeduction - qbiDeduction - standardDeduction
  );

  /** Taxable income WITHOUT SE deductions (only standard deduction) */
  const taxableIncomeWithoutDeductions = Math.max(
    0,
    grossIncome - standardDeduction
  );

  const federalIncomeTaxWithDeductions = calcFederalIncomeTax(
    taxableIncomeWithDeductions,
    filingStatus
  );

  const federalIncomeTaxWithoutDeductions = calcFederalIncomeTax(
    taxableIncomeWithoutDeductions,
    filingStatus
  );

  const totalSavings = Math.max(
    0,
    federalIncomeTaxWithoutDeductions - federalIncomeTaxWithDeductions
  );

  return {
    grossIncome,
    netSEIncome,
    seTax,
    seDeduction,
    qbiDeduction,
    standardDeduction,
    taxableIncomeWithDeductions,
    taxableIncomeWithoutDeductions,
    federalIncomeTaxWithDeductions,
    federalIncomeTaxWithoutDeductions,
    totalSavings,
  };
}

/** SE_TAX_RATE re-exported for use in UI labels */
export { SE_TAX_RATE };
