const MORTGAGE_RATE = 0.05;
const AMORTIZATION_MONTHS = 25 * 12;
const MONTHLY_RATE = MORTGAGE_RATE / 12;
const GDS_THRESHOLD = 0.3;
const CREDIT_SCORE_CUTOFF = 600;
const CREDIT_SCORE_SCALE_MIN = 300;
const CREDIT_SCORE_SCALE_MAX = 900;

export interface ValidationErrors {
  houseValue?: string;
  downPayment?: string;
  annualIncome?: string;
  creditScore?: string;
}

export type VerdictLabel = 'Likely approved' | 'Borderline' | 'Unlikely' | 'Not eligible';

export interface AffordabilityResult {
  likelihood: number;
  monthlyPayment: number;
  gdsRatio: number;
  verdict: VerdictLabel;
  explanation: string;
}

/**
 * Calculates monthly mortgage payment using standard amortization.
 * Rate: 5% annual, 25-year amortization.
 */
export function calculateMonthlyPayment(loanAmount: number): number {
  if (loanAmount <= 0) return 0;
  const factor = Math.pow(1 + MONTHLY_RATE, AMORTIZATION_MONTHS);
  return (loanAmount * MONTHLY_RATE * factor) / (factor - 1);
}

/**
 * Calculates gross debt service (GDS) ratio: monthly payment / gross monthly income.
 */
export function calculateGdsRatio(monthlyPayment: number, annualIncome: number): number {
  return monthlyPayment / (annualIncome / 12);
}

/**
 * Calculates approval likelihood (0–100%) from affordability and credit score.
 * Returns 0 for credit scores below 600.
 */
export function calculateApprovalLikelihood(
  monthlyPayment: number,
  annualIncome: number,
  creditScore: number,
): number {
  if (creditScore < CREDIT_SCORE_CUTOFF) return 0;
  const monthlyIncome = annualIncome / 12;
  const affordabilityScore = Math.min(1, (GDS_THRESHOLD * monthlyIncome) / monthlyPayment);
  const creditFactor =
    (creditScore - CREDIT_SCORE_SCALE_MIN) / (CREDIT_SCORE_SCALE_MAX - CREDIT_SCORE_SCALE_MIN);
  return Math.round(Math.max(0, affordabilityScore * creditFactor * 100));
}

/**
 * Returns the verdict label based on likelihood and credit score.
 */
export function getVerdict(likelihood: number, creditScore: number): VerdictLabel {
  if (creditScore < CREDIT_SCORE_CUTOFF) return 'Not eligible';
  if (likelihood >= 75) return 'Likely approved';
  if (likelihood >= 50) return 'Borderline';
  return 'Unlikely';
}

/**
 * Builds a one-line plain-English explanation of the affordability result.
 */
export function buildExplanation(gdsRatio: number, creditScore: number): string {
  const gdsPercent = Math.round(gdsRatio * 100);
  const direction = gdsRatio <= GDS_THRESHOLD ? 'below' : 'above';
  const creditNote =
    creditScore < CREDIT_SCORE_CUTOFF
      ? `your credit score of ${creditScore} is below the minimum 600 requirement`
      : `your credit score of ${creditScore} meets the minimum requirement`;
  return (
    `Your estimated housing cost is ${gdsPercent}% of your gross monthly income` +
    ` — ${direction} the 30% target — and ${creditNote}.`
  );
}

/**
 * Validates user inputs and returns an object of error messages (empty = no errors).
 */
export function validateInputs(
  houseValue: number,
  downPayment: number,
  annualIncome: number,
  creditScore: number,
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isNaN(houseValue) || houseValue <= 0) {
    errors.houseValue = 'House value must be greater than 0.';
  }
  if (isNaN(downPayment) || downPayment < 0) {
    errors.downPayment = 'Down payment must be 0 or more.';
  } else if (!isNaN(houseValue) && houseValue > 0 && downPayment >= houseValue) {
    errors.downPayment = 'Down payment must be less than the house value.';
  }
  if (isNaN(annualIncome) || annualIncome <= 0) {
    errors.annualIncome = 'Annual gross income must be greater than 0.';
  }
  if (
    isNaN(creditScore) ||
    creditScore < CREDIT_SCORE_SCALE_MIN ||
    creditScore > CREDIT_SCORE_SCALE_MAX
  ) {
    errors.creditScore = `Credit score must be between ${CREDIT_SCORE_SCALE_MIN} and ${CREDIT_SCORE_SCALE_MAX}.`;
  }

  return errors;
}

/**
 * Runs a full affordability check given valid numeric inputs.
 */
export function runAffordabilityCheck(
  houseValue: number,
  downPayment: number,
  annualIncome: number,
  creditScore: number,
): AffordabilityResult {
  const loanAmount = houseValue - downPayment;
  const monthlyPayment = calculateMonthlyPayment(loanAmount);
  const gdsRatio = calculateGdsRatio(monthlyPayment, annualIncome);
  const likelihood = calculateApprovalLikelihood(monthlyPayment, annualIncome, creditScore);
  const verdict = getVerdict(likelihood, creditScore);
  const explanation = buildExplanation(gdsRatio, creditScore);
  return { likelihood, monthlyPayment, gdsRatio, verdict, explanation };
}
