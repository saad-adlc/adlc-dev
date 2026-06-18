import styles from '../app.module.css';

interface SummaryCardsProps {
  total: number;
  count: number;
  topCategory: string;
}

/** Three metric cards: total spent, expense count, top category. */
export default function SummaryCards({ total, count, topCategory }: SummaryCardsProps) {
  return (
    <div className={styles.summaryCards}>
      <div className={styles.card}>
        <p className={styles.cardLabel}>Total spent</p>
        <p className={styles.cardValue}>${total.toFixed(2)}</p>
      </div>
      <div className={styles.card}>
        <p className={styles.cardLabel}>Expenses logged</p>
        <p className={styles.cardValue}>{count}</p>
      </div>
      <div className={styles.card}>
        <p className={styles.cardLabel}>Top category</p>
        <p className={styles.cardValue}>{topCategory || '—'}</p>
      </div>
    </div>
  );
}
