import { formatCurrency } from '../utils';
import styles from './summary-cards.module.css';

interface SummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
}

/** Displays monthly totals for income, expenses, and balance. */
export default function SummaryCards({ income, expenses, balance }: SummaryCardsProps) {
  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <span className={styles.label}>Total income</span>
        <span className={`${styles.amount} ${styles.incomeColor}`}>{formatCurrency(income)}</span>
      </div>
      <div className={styles.card}>
        <span className={styles.label}>Total expenses</span>
        <span className={`${styles.amount} ${styles.expenseColor}`}>
          {formatCurrency(expenses)}
        </span>
      </div>
      <div className={styles.card}>
        <span className={styles.label}>Balance</span>
        <span className={styles.amount}>{formatCurrency(balance)}</span>
      </div>
    </div>
  );
}
