import type { Expense } from '../types';
import { downloadCsv } from '../csv';
import styles from '../app.module.css';

interface ExpenseTableProps {
  expenses: Expense[];
  filteredExpenses: Expense[];
  activeFilter: string;
  onDelete: (id: string) => void;
}

/** Table showing expense entries with running total and CSV export. */
export default function ExpenseTable({
  filteredExpenses,
  activeFilter,
  onDelete,
}: ExpenseTableProps) {
  const runningTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  function handleDelete(expense: Expense) {
    if (window.confirm(`Delete expense of $${expense.amount.toFixed(2)} for ${expense.category}?`)) {
      onDelete(expense.id);
    }
  }

  function handleExport() {
    downloadCsv(filteredExpenses);
  }

  return (
    <div>
      <div className={styles.tableHeader}>
        <h3>
          {activeFilter ? `Expenses — ${activeFilter}` : 'All Expenses'}
        </h3>
        <button className={styles.btnSecondary} onClick={handleExport}>
          Export CSV
        </button>
      </div>
      <p className={styles['running-total']}>
        Running total: ${runningTotal.toFixed(2)}
      </p>
      {filteredExpenses.length === 0 ? (
        <p className={styles.emptyState}>No expenses found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Notes</th>
              <th className={styles.amountCell}>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((e) => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td>{e.category}</td>
                <td>{e.notes}</td>
                <td className={styles.amountCell}>${e.amount.toFixed(2)}</td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(e)}
                    aria-label={`Delete expense ${e.id}`}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
