import type { Expense } from './expenses';
import { grandTotal } from './expenses';
import SpendBarChart from './spend-bar-chart';
import styles from './overview-page.module.css';

interface Props {
  expenses: Expense[];
}

/** Formats an amount as a USD string with 2 decimal places. */
function formatAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** Overview page: grand total, transaction count, and spend-by-category chart. */
export default function OverviewPage({ expenses }: Props) {
  const total = grandTotal(expenses);

  return (
    <section className={styles.page}>
      <h1 className={styles.heading}>Overview</h1>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total Spent</span>
          <span className={styles.statValue}>{formatAmount(total)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Transactions</span>
          <span className={styles.statValue}>{expenses.length}</span>
        </div>
      </div>
      <h2 className={styles.chartHeading}>Spend by Category</h2>
      <SpendBarChart expenses={expenses} />
    </section>
  );
}
