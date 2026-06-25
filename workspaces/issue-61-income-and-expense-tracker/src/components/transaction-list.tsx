import { formatCurrency, monthLabel } from '../utils';
import type { Transaction } from '../types';
import styles from './transaction-list.module.css';

interface TransactionListProps {
  year: number;
  month: number;
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

/** Returns the signed amount string: "+$50.00" or "−$50.00". */
function signedAmount(tx: Transaction): string {
  const prefix = tx.type === 'income' ? '+' : '−';
  return `${prefix}${formatCurrency(tx.amount)}`;
}

/** Renders a single transaction row. */
function TransactionRow({
  tx,
  onDelete,
}: {
  tx: Transaction;
  onDelete: (id: string) => void;
}) {
  return (
    <li className={styles.item}>
      <div className={styles.left}>
        <span className={`${styles.badge} ${styles[tx.type]}`}>{tx.type}</span>
        <span className={styles.category}>{tx.category}</span>
        {tx.note && <span className={styles.note}>{tx.note}</span>}
      </div>
      <div className={styles.right}>
        <span className={`${styles.amount} ${styles[tx.type]}`}>{signedAmount(tx)}</span>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(tx.id)}
          aria-label="Delete transaction"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </li>
  );
}

/** Lists all transactions for the selected month with delete controls. */
export default function TransactionList({
  year,
  month,
  transactions,
  onDelete,
}: TransactionListProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Transactions &mdash; {monthLabel(year, month)}</h2>
      {transactions.length === 0 ? (
        <p className={styles.empty}>No transactions for this month.</p>
      ) : (
        <ul className={styles.list}>
          {transactions.map(tx => (
            <TransactionRow key={tx.id} tx={tx} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}
