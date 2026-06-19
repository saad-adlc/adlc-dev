/** Pure calculation and formatting utilities for the Canadian mortgage calculator. */

export const PAYMENTS_PER_YEAR = 12;
export const DEFAULT_RATE = 5.0;
export const DEFAULT_DOWN_PERCENT = 20;
export const DEFAULT_AMORTIZATION_YEARS = 25;
export const CMHC_THRESHOLD_PERCENT = 20;
export const MIN_TERM_YEARS = 5;
export const MAX_TERM_YEARS = 35;
export const MAX_RATE_PERCENT = 25;

const SEMI_ANNUAL_PERIODS = 2;
const MONTHS_PER_SEMI_ANNUAL = 6;

export interface PaymentRow {
  paymentNumber: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface YearSummary {
  year: number;
  totalInterest: number;
  totalPrincipal: number;
  endingBalance: number;
  rows: PaymentRow[];
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Compute the effective monthly rate using Canadian semi-annual compounding.
 * Formula: (1 + r/2)^(1/6) − 1
 */
export function calculateMonthlyRate(annualRatePercent: number): number {
  const r = annualRatePercent / 100;
  return Math.pow(1 + r / SEMI_ANNUAL_PERIODS, 1 / MONTHS_PER_SEMI_ANNUAL) - 1;
}

/**
 * Calculate the fixed monthly mortgage payment (standard annuity formula).
 */
export function calculateMonthlyPayment(
  principal: number,
  monthlyRate: number,
  totalPayments: number,
): number {
  if (monthlyRate === 0) return principal / totalPayments;
  const factor = Math.pow(1 + monthlyRate, totalPayments);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * Validate mortgage inputs. Returns a ValidationError or null when valid.
 */
export function validateInputs(
  homePrice: number,
  downPayment: number,
  annualRate: number,
  amortizationYears: number,
): ValidationError | null {
  if (!isFinite(homePrice) || homePrice <= 0) {
    return { field: 'homePrice', message: 'Home price must be greater than $0.' };
  }
  if (!isFinite(downPayment) || downPayment < 0 || downPayment >= homePrice) {
    return { field: 'downPayment', message: 'Down payment must be $0 or more and less than the home price.' };
  }
  if (!isFinite(annualRate) || annualRate <= 0 || annualRate > MAX_RATE_PERCENT) {
    return { field: 'rate', message: `Interest rate must be between 0.01% and ${MAX_RATE_PERCENT}%.` };
  }
  if (
    !isFinite(amortizationYears) ||
    amortizationYears < MIN_TERM_YEARS ||
    amortizationYears > MAX_TERM_YEARS
  ) {
    return {
      field: 'amortization',
      message: `Amortization period must be between ${MIN_TERM_YEARS} and ${MAX_TERM_YEARS} years.`,
    };
  }
  return null;
}

/**
 * Generate the full amortization schedule grouped by year.
 */
export function generateAmortizationSchedule(
  principal: number,
  monthlyRate: number,
  amortizationYears: number,
): YearSummary[] {
  const totalPayments = amortizationYears * PAYMENTS_PER_YEAR;
  const monthlyPayment = calculateMonthlyPayment(principal, monthlyRate, totalPayments);
  let balance = principal;
  const summaries: YearSummary[] = [];

  for (let year = 1; year <= amortizationYears; year++) {
    const rows: PaymentRow[] = [];
    let yearInterest = 0;
    let yearPrincipal = 0;

    for (let month = 1; month <= PAYMENTS_PER_YEAR; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
      balance = Math.max(balance - principalPayment, 0);

      yearInterest += interestPayment;
      yearPrincipal += principalPayment;
      rows.push({
        paymentNumber: (year - 1) * PAYMENTS_PER_YEAR + month,
        interest: interestPayment,
        principal: principalPayment,
        balance,
      });
    }

    summaries.push({
      year,
      totalInterest: yearInterest,
      totalPrincipal: yearPrincipal,
      endingBalance: balance,
      rows,
    });
  }

  return summaries;
}

/**
 * Returns true when the down payment is below the CMHC insurance threshold.
 */
export function needsCmhcInsurance(homePrice: number, downPayment: number): boolean {
  if (homePrice <= 0) return false;
  return (downPayment / homePrice) * 100 < CMHC_THRESHOLD_PERCENT;
}

/** Format a number as Canadian currency. */
export function formatCAD(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(amount);
}
