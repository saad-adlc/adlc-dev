import { formatCurrency } from '../lib/format';
import type { TakeHomeResult } from '../lib/tax-calculator';
import styles from './results-cards.module.css';

interface ResultCardsProps {
  result: TakeHomeResult;
}

/** Displays take-home pay as three result cards: hourly, monthly, and yearly. */
export default function ResultCards({ result }: ResultCardsProps) {
  const { takeHomeHourly, takeHomeMonthly, takeHomeYearly } = result;

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <span className={styles.label}>Take-home hourly</span>
        <span className={styles.value}>{formatCurrency(takeHomeHourly)}</span>
        <span className={styles.sub}>per hour</span>
      </div>
      <div className={styles.card}>
        <span className={styles.label}>Take-home monthly</span>
        <span className={styles.value}>{formatCurrency(takeHomeMonthly)}</span>
        <span className={styles.sub}>per month</span>
      </div>
      <div className={styles.card}>
        <span className={styles.label}>Take-home yearly</span>
        <span className={styles.value}>{formatCurrency(takeHomeYearly)}</span>
        <span className={styles.sub}>per year</span>
      </div>
    </div>
  );
}
