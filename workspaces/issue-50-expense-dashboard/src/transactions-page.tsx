import { useState } from 'react';
import type { Expense } from './expenses';
import { CATEGORIES } from './expenses';
import styles from './transactions-page.module.css';

const ALL_FILTER = 'All';

interface Props {
  expenses: Expense[];
}

/** Formats a dollar amount to 2 decimal places with $ prefix. */
function formatAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** Transactions view with a filterable expense table. */
export default function TransactionsPage({ expenses }: Props) {
  const [filter, setFilter] = useState<string>(ALL_FILTER);

  const filtered =
    filter === ALL_FILTER ? expenses : expenses.filter(e => e.category === filter);

  return (
    <section className={styles.page}>
      <h1 className={styles.heading}>Transactions</h1>
      <div className={styles.filters}>
        <button
          className={filter === ALL_FILTER ? styles.filterActive : styles.filter}
          onClick={() => setFilter(ALL_FILTER)}
        >
          {ALL_FILTER}
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={filter === cat ? styles.filterActive : styles.filter}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Merchant</th>
            <th scope="col">Category</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(expense => (
            <tr key={`${expense.date}-${expense.merchant}`}>
              <td>{expense.date}</td>
              <td>{expense.merchant}</td>
              <td>{expense.category}</td>
              <td>{formatAmount(expense.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
