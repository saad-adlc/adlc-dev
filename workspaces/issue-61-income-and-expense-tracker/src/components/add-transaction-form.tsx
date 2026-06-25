import { useState } from 'react';
import type { Transaction } from '../types';
import styles from './add-transaction-form.module.css';

interface AddTransactionFormProps {
  categories: readonly string[];
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
}

interface FormState {
  amount: string;
  type: 'income' | 'expense';
  category: string;
  note: string;
  date: string;
}

/** Returns true when the select value is a valid transaction type. */
function isValidType(value: string): value is 'income' | 'expense' {
  return value === 'income' || value === 'expense';
}

/** Form that collects transaction details and calls onAdd on valid submission. */
export default function AddTransactionForm({ categories, onAdd }: AddTransactionFormProps) {
  const [form, setForm] = useState<FormState>(() => ({
    amount: '',
    type: 'expense',
    category: categories[0] ?? 'Other',
    note: '',
    date: new Date().toISOString().slice(0, 10),
  }));

  function updateField(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;
    const type = isValidType(form.type) ? form.type : 'expense';
    onAdd({ amount, type, category: form.category, note: form.note, date: form.date });
    setForm(prev => ({ ...prev, amount: '', note: '' }));
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Add transaction</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row3}>
          <label className={styles.field}>
            Amount
            <input
              className={styles.input}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={e => updateField('amount', e.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            Type
            <select
              className={styles.input}
              value={form.type}
              onChange={e => updateField('type', e.target.value)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label className={styles.field}>
            Category
            <select
              className={styles.input}
              value={form.category}
              onChange={e => updateField('category', e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.row2}>
          <label className={styles.field}>
            Date
            <input
              className={styles.input}
              type="date"
              value={form.date}
              onChange={e => updateField('date', e.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            Note (optional)
            <input
              className={styles.input}
              type="text"
              placeholder="Optional note"
              value={form.note}
              onChange={e => updateField('note', e.target.value)}
            />
          </label>
        </div>
        <button className={styles.submit} type="submit">
          Add transaction
        </button>
      </form>
    </section>
  );
}
