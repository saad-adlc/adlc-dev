import { type BracketDetail, type TaxBreakdown, type TaxResult } from '../utils/tax-calc';
import styles from './results-panel.module.css';

interface ResultsPanelProps {
  result: TaxResult;
}

const CAD = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });
const PCT = new Intl.NumberFormat('en-CA', { style: 'percent', minimumFractionDigits: 2 });

function fmt(n: number): string {
  return CAD.format(n);
}

function fmtRate(r: number): string {
  return PCT.format(r);
}

function fmtRange(lower: number, upper: number | null): string {
  const lo = CAD.format(lower);
  if (upper === null) return `${lo}+`;
  return `${lo} – ${CAD.format(upper)}`;
}

interface BracketTableProps {
  breakdown: TaxBreakdown;
  label: string;
  testIdPrefix: string;
}

function BracketTable({ breakdown, label, testIdPrefix }: BracketTableProps) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span>{label}</span>
        <span data-testid={`${testIdPrefix}-total`}>{fmt(breakdown.totalTax)}</span>
      </div>
      <table className={styles.bracketTable} aria-label={`${label} brackets`}>
        <thead>
          <tr>
            <th>Range</th>
            <th>Rate</th>
            <th>Taxable</th>
            <th>Tax</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.brackets.map((b: BracketDetail, i: number) => (
            <tr key={i} data-testid={`${testIdPrefix}-bracket-${i}`}>
              <td>{fmtRange(b.lower, b.upper)}</td>
              <td>{fmtRate(b.rate)}</td>
              <td>{fmt(b.taxableAmount)}</td>
              <td>{fmt(b.tax)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** ResultsPanel — deduction summary, bracket tables, and net take-home. */
export default function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <section className={styles.panel} aria-label="Tax calculation results">
      <h2 className={styles.heading}>Tax Breakdown</h2>

      <div className={styles.summary}>
        <div className={styles.row}>
          <span>Gross Income</span>
          <span data-testid="gross">{fmt(result.gross)}</span>
        </div>
        <div className={styles.row}>
          <span>CPP Contribution</span>
          <span data-testid="cpp">−{fmt(result.cpp)}</span>
        </div>
        <div className={styles.row}>
          <span>EI Premium</span>
          <span data-testid="ei">−{fmt(result.ei)}</span>
        </div>
      </div>

      <BracketTable
        breakdown={result.federalTax}
        label="Federal Income Tax"
        testIdPrefix="federal"
      />

      <BracketTable
        breakdown={result.provincialTax}
        label="Ontario Provincial Tax"
        testIdPrefix="ontario"
      />

      <div className={styles.totals}>
        <div className={styles.row}>
          <span>Total Deductions</span>
          <span data-testid="total-deductions">−{fmt(result.totalDeductions)}</span>
        </div>
      </div>

      <div className={styles.takeHome}>
        <h3 className={styles.takeHomeHeading}>Net Take-Home</h3>
        <div className={styles.takeHomeGrid}>
          <div className={styles.takeHomeItem}>
            <span className={styles.takeHomeLabel}>Annual</span>
            <span className={styles.takeHomeValue} data-testid="net-annual">
              {fmt(result.netAnnual)}
            </span>
          </div>
          <div className={styles.takeHomeItem}>
            <span className={styles.takeHomeLabel}>Monthly</span>
            <span className={styles.takeHomeValue} data-testid="net-monthly">
              {fmt(result.netMonthly)}
            </span>
          </div>
          <div className={styles.takeHomeItem}>
            <span className={styles.takeHomeLabel}>Per Paycheque</span>
            <span className={styles.takeHomeSubLabel}>(biweekly, 26/yr)</span>
            <span className={styles.takeHomeValue} data-testid="net-paycheque">
              {fmt(result.netPerPaycheque)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
