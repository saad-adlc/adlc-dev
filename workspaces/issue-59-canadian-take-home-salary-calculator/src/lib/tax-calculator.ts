/** 2024 Canadian income tax types and calculation engine (Ontario). */

export interface BracketDetail {
  type: string;
  bracket: string;
  rate: string;
  amount: number;
}

export interface TakeHomeResult {
  grossYearly: number;
  federalTax: number;
  provincialTax: number;
  cpp: number;
  ei: number;
  totalDeductions: number;
  takeHomeYearly: number;
  takeHomeMonthly: number;
  takeHomeHourly: number;
  effectiveTaxRate: number;
  breakdown: BracketDetail[];
}

interface TaxBracket {
  readonly min: number;
  readonly max: number;
  readonly rate: number;
}

const HOURS_PER_YEAR = 2080;
const MONTHS_PER_YEAR = 12;

const FEDERAL_BRACKETS: readonly TaxBracket[] = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 154906, rate: 0.26 },
  { min: 154906, max: 220000, rate: 0.29 },
  { min: 220000, max: Infinity, rate: 0.33 },
];
const FEDERAL_BPA = 15705;
const FEDERAL_BPA_RATE = 0.15;

const ONTARIO_BRACKETS: readonly TaxBracket[] = [
  { min: 0, max: 51446, rate: 0.0505 },
  { min: 51446, max: 102894, rate: 0.0915 },
  { min: 102894, max: 150000, rate: 0.1116 },
  { min: 150000, max: 220000, rate: 0.1216 },
  { min: 220000, max: Infinity, rate: 0.1316 },
];
const ONTARIO_BPA = 11865;
const ONTARIO_BPA_RATE = 0.0505;

const CPP_RATE = 0.0595;
const CPP_MAX_PENSIONABLE = 68500;
const CPP_BASIC_EXEMPTION = 3500;
const CPP_MAX_CONTRIBUTION = (CPP_MAX_PENSIONABLE - CPP_BASIC_EXEMPTION) * CPP_RATE;

const EI_RATE = 0.0166;
const EI_MAX_INSURABLE = 63200;

function rateToString(rate: number): string {
  return `${(rate * 100).toFixed(2).replace(/\.?0+$/, '')}%`;
}

function calcBracketDetails(
  income: number,
  brackets: readonly TaxBracket[],
  typeLabel: string,
): BracketDetail[] {
  return brackets
    .filter(b => income > b.min)
    .map(b => {
      const taxable = Math.min(income, b.max) - b.min;
      const maxLabel = b.max === Infinity ? '+' : `$${b.max.toLocaleString('en-CA')}`;
      return {
        type: typeLabel,
        bracket: `$${b.min.toLocaleString('en-CA')} – ${maxLabel}`,
        rate: rateToString(b.rate),
        amount: taxable * b.rate,
      };
    });
}

/** Calculates 2024 federal income tax including Basic Personal Amount credit. */
export function calculateFederalTax(income: number): { tax: number; details: BracketDetail[] } {
  const grossDetails = calcBracketDetails(income, FEDERAL_BRACKETS, 'Federal');
  const grossTax = grossDetails.reduce((sum, d) => sum + d.amount, 0);
  const creditAmount = Math.min(grossTax, FEDERAL_BPA * FEDERAL_BPA_RATE);
  const details: BracketDetail[] = [...grossDetails];
  if (creditAmount > 0) {
    details.push({
      type: 'Federal',
      bracket: 'Basic Personal Amount',
      rate: rateToString(FEDERAL_BPA_RATE),
      amount: -creditAmount,
    });
  }
  return { tax: Math.max(0, grossTax - creditAmount), details };
}

/** Calculates 2024 Ontario provincial income tax including Basic Personal Amount credit. */
export function calculateOntarioTax(income: number): { tax: number; details: BracketDetail[] } {
  const grossDetails = calcBracketDetails(income, ONTARIO_BRACKETS, 'Ontario');
  const grossTax = grossDetails.reduce((sum, d) => sum + d.amount, 0);
  const creditAmount = Math.min(grossTax, ONTARIO_BPA * ONTARIO_BPA_RATE);
  const details: BracketDetail[] = [...grossDetails];
  if (creditAmount > 0) {
    details.push({
      type: 'Ontario',
      bracket: 'Basic Personal Amount',
      rate: rateToString(ONTARIO_BPA_RATE),
      amount: -creditAmount,
    });
  }
  return { tax: Math.max(0, grossTax - creditAmount), details };
}

/** Calculates 2024 Canada Pension Plan contribution (employee share). */
export function calculateCPP(income: number): number {
  const pensionable = Math.max(0, Math.min(income, CPP_MAX_PENSIONABLE) - CPP_BASIC_EXEMPTION);
  return Math.min(pensionable * CPP_RATE, CPP_MAX_CONTRIBUTION);
}

/** Calculates 2024 Employment Insurance premium (employee share). */
export function calculateEI(income: number): number {
  return Math.min(income, EI_MAX_INSURABLE) * EI_RATE;
}

/** Calculates complete take-home pay and breakdown for a 2024 Ontario employee. */
export function calculateTakeHome(yearlyIncome: number): TakeHomeResult {
  const federal = calculateFederalTax(yearlyIncome);
  const ontario = calculateOntarioTax(yearlyIncome);
  const cpp = calculateCPP(yearlyIncome);
  const ei = calculateEI(yearlyIncome);
  const totalDeductions = federal.tax + ontario.tax + cpp + ei;
  const takeHomeYearly = Math.max(0, yearlyIncome - totalDeductions);

  const cppDetail: BracketDetail = {
    type: 'CPP',
    bracket: `$${CPP_BASIC_EXEMPTION.toLocaleString('en-CA')} – $${CPP_MAX_PENSIONABLE.toLocaleString('en-CA')}`,
    rate: rateToString(CPP_RATE),
    amount: cpp,
  };
  const eiDetail: BracketDetail = {
    type: 'EI',
    bracket: `$0 – $${EI_MAX_INSURABLE.toLocaleString('en-CA')}`,
    rate: rateToString(EI_RATE),
    amount: ei,
  };

  return {
    grossYearly: yearlyIncome,
    federalTax: federal.tax,
    provincialTax: ontario.tax,
    cpp,
    ei,
    totalDeductions,
    takeHomeYearly,
    takeHomeMonthly: takeHomeYearly / MONTHS_PER_YEAR,
    takeHomeHourly: takeHomeYearly / HOURS_PER_YEAR,
    effectiveTaxRate: yearlyIncome > 0 ? totalDeductions / yearlyIncome : 0,
    breakdown: [...federal.details, ...ontario.details, cppDetail, eiDetail],
  };
}
