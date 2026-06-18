import { useState } from 'react';
import type { Category, Expense } from '../types';
import styles from '../app.module.css';

const MAX_NOTES = 280;
const TODAY = new Date().toISOString().slice(0, 10);

interface AddExpenseFormProps {
  categories: Category[];
  onAdd: (draft: Omit<Expense, 'id'>) => void;
}

interface FormErrors {
  amount?: string;
  category?: string;
  date?: string;
}

/** Form for adding a new expense entry. */
export default function AddExpenseForm({ categories, onAdd }: AddExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(TODAY);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const errs: FormErrors = {};
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      errs.amount = 'Amount must be a positive number.';
    }
    if (!category) errs.category = 'Category is required.';
    if (!date) errs.date = 'Date is required.';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onAdd({ amount: parseFloat(amount), category, date, notes });
    setAmount('');
    setCategory('');
    setDate(TODAY);
    setNotes('');
    setErrors({});
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label htmlFor="et-amount">Amount ($)</label>
          <input
            id="et-amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          {errors.amount && <span className={styles.formError}>{errors.amount}</span>}
        </div>

        <div className={styles.formField}>
          <label htmlFor="et-category">Category</label>
          <select
            id="et-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          {errors.category && <span className={styles.formError}>{errors.category}</span>}
        </div>

        <div className={styles.formField}>
          <label htmlFor="et-date">Date</label>
          <input
            id="et-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <span className={styles.formError}>{errors.date}</span>}
        </div>

        <div className={styles.formField}>
          <label htmlFor="et-notes">Notes (optional)</label>
          <textarea
            id="et-notes"
            value={notes}
            maxLength={MAX_NOTES}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional note…"
          />
        </div>

        <button type="submit" className={styles.btnPrimary}>
          Add expense
        </button>
      </div>
    </form>
  );
}
