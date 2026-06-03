/**
 * Calculates the fixed monthly payment for an amortising loan.
 *
 * @param principal - Loan amount in USD (asset cost minus down payment)
 * @param annualRatePercent - Annual interest rate as a percentage (e.g. 6 for 6%)
 * @param termMonths - Loan term in months
 * @returns Monthly payment in USD, or 0 for degenerate inputs
 */
export function calculateMonthlyLoanPayment(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) return 0;

  const monthlyRate = annualRatePercent / 100 / 12;

  if (monthlyRate === 0) {
    return principal / termMonths;
  }

  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * Calculates the total cost of leasing an asset over the full term.
 *
 * @param monthlyLeasePayment - Fixed monthly lease payment in USD
 * @param termMonths - Lease term in months
 * @returns Total lease cost in USD
 */
export function calculateTotalLeaseCost(
  monthlyLeasePayment: number,
  termMonths: number,
): number {
  return monthlyLeasePayment * termMonths;
}

/**
 * Calculates the net total cost of buying an asset over the lease term.
 * Net cost = down payment + (monthly loan payment × term) − residual value.
 * Clamped to 0 to prevent negative results when residual exceeds outlay.
 *
 * @param monthlyLoanPayment - Computed monthly loan payment in USD
 * @param termMonths - Loan term in months
 * @param downPayment - Down payment in USD
 * @param residualValue - Estimated asset value at end of term in USD
 * @returns Net buy cost in USD (≥ 0)
 */
export function calculateTotalBuyCost(
  monthlyLoanPayment: number,
  termMonths: number,
  downPayment: number,
  residualValue: number,
): number {
  const totalOutlay = downPayment + monthlyLoanPayment * termMonths;
  return Math.max(0, totalOutlay - residualValue);
}
