import { formatCurrency } from '../lib/format';
import type { BracketDetail } from '../lib/tax-calculator';
import styles from './tax-breakdown-table.module.css';

interface TaxBreakdownTableProps {
  breakdown: BracketDetail[];
  effectiveTaxRate: number;
}

/** Tax breakdown table: each bracket, CPP, EI rows and an effective-rate footer. */
export default function TaxBreakdownTable({ breakdown, effectiveTaxRate }: TaxBreakdownTableProps) {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Tax Breakdown</h2>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Bracket</th>
              <th>Rate</th>
              <th className={styles.amountCol}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row, i) => (
              <tr
                key={`${row.type}-${i}`}
                className={row.amount < 0 ? styles.creditRow : undefined}
              >
                <td>{row.type}</td>
                <td>{row.bracket}</td>
                <td>{row.rate}</td>
                <td className={styles.amountCol}>{formatCurrency(row.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              <td colSpan={3}>Effective tax rate</td>
              <td className={styles.amountCol}>{(effectiveTaxRate * 100).toFixed(2)}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
