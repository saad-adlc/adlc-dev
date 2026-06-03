import { TaxSavingsResult } from '../utils/tax-calculations';

/** Props for ResultsCard */
export interface ResultsCardProps {
  result: TaxSavingsResult | null;
}

/** Formats a number as USD currency string */
function formatUSD(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

/**
 * ResultsCard — displays a single card summarising the tax savings calculation.
 * Shows deductions breakdown and total savings vs. no-deductions baseline.
 */
export default function ResultsCard({ result }: ResultsCardProps) {
  if (!result || result.grossIncome <= 0) {
    return (
      <div className="results-card results-card--empty">
        <p>Enter your income above to see your estimated tax savings.</p>
      </div>
    );
  }

  return (
    <div className="results-card">
      <h2>2025 Estimated Tax Savings</h2>

      <div className="results-highlight">
        <span className="results-highlight__label">Total Federal Tax Savings</span>
        <span className="results-highlight__value">
          {formatUSD(result.totalSavings)}
        </span>
      </div>

      <section className="results-section">
        <h3>Your Deductions</h3>
        <dl className="results-table">
          <div className="results-row">
            <dt>Standard Deduction</dt>
            <dd>{formatUSD(result.standardDeduction)}</dd>
          </div>
          <div className="results-row">
            <dt>SE Tax Deduction (50% of SE tax)</dt>
            <dd>{formatUSD(result.seDeduction)}</dd>
          </div>
          <div className="results-row">
            <dt>QBI Deduction (20% of net SE income)</dt>
            <dd>{formatUSD(result.qbiDeduction)}</dd>
          </div>
        </dl>
      </section>

      <section className="results-section">
        <h3>Tax Comparison</h3>
        <dl className="results-table">
          <div className="results-row">
            <dt>Taxable Income (without SE deductions)</dt>
            <dd>{formatUSD(result.taxableIncomeWithoutDeductions)}</dd>
          </div>
          <div className="results-row">
            <dt>Taxable Income (with SE deductions)</dt>
            <dd>{formatUSD(result.taxableIncomeWithDeductions)}</dd>
          </div>
          <div className="results-row">
            <dt>Federal Income Tax (without SE deductions)</dt>
            <dd>{formatUSD(result.federalIncomeTaxWithoutDeductions)}</dd>
          </div>
          <div className="results-row">
            <dt>Federal Income Tax (with SE deductions)</dt>
            <dd>{formatUSD(result.federalIncomeTaxWithDeductions)}</dd>
          </div>
          <div className="results-row">
            <dt>Self-Employment Tax</dt>
            <dd>{formatUSD(result.seTax)}</dd>
          </div>
        </dl>
      </section>

      <p className="results-disclaimer">
        Estimates only. Does not include state tax, credits, or AMT.
        Consult a tax professional for personalised advice.
      </p>
    </div>
  );
}
