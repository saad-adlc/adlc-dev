import { useState, useEffect, type CSSProperties } from 'react';
import { progressColor, formatCurrency, monthLabel } from '../utils';
import type { MonthBudgets } from '../types';
import styles from './budget-section.module.css';

interface BudgetSectionProps {
  year: number;
  month: number;
  categories: readonly string[];
  budgets: MonthBudgets;
  spent: Record<string, number>;
  onSetBudget: (category: string, amount: number) => void;
}

interface BudgetRowProps {
  category: string;
  budgetAmount: number;
  spentAmount: number;
  onSetBudget: (category: string, amount: number) => void;
}

/** Renders one category row with a progress bar and a budget input. */
function BudgetRow({ category, budgetAmount, spentAmount, onSetBudget }: BudgetRowProps) {
  const [draft, setDraft] = useState(budgetAmount > 0 ? String(budgetAmount) : '');

  useEffect(() => {
    setDraft(budgetAmount > 0 ? String(budgetAmount) : '');
  }, [budgetAmount]);

  const fillPct =
    budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * FULL_PERCENT, FULL_PERCENT) : 0;
  const color = progressColor(spentAmount, budgetAmount);

  function handleBlur() {
    const parsed = parseFloat(draft);
    onSetBudget(category, isNaN(parsed) || parsed < 0 ? 0 : parsed);
  }

  const barStyle = { '--fill': `${fillPct}%` } as CSSProperties;

  return (
    <div className={styles.row}>
      <div className={styles.rowHeader}>
        <span className={styles.categoryName}>{category}</span>
        <span className={styles.spentLabel}>
          {formatCurrency(spentAmount)}
          {' / '}
          {budgetAmount > 0 ? formatCurrency(budgetAmount) : 'no limit'}
        </span>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={`${styles.progressFill} ${styles[color]}`}
          style={barStyle}
          role="progressbar"
          aria-valuenow={Math.round(fillPct)}
          aria-valuemin={0}
          aria-valuemax={FULL_PERCENT}
          aria-label={`${category} budget progress`}
        />
      </div>
      <label className={styles.budgetLabel}>
        Budget ($)
        <input
          className={styles.budgetInput}
          type="number"
          min="0"
          step="0.01"
          value={draft}
          placeholder="Set limit"
          onChange={e => setDraft(e.target.value)}
          onBlur={handleBlur}
          aria-label={`Budget for ${category}`}
        />
      </label>
    </div>
  );
}

const FULL_PERCENT = 100;

/** Displays per-category budget rows with progress bars for the selected month. */
export default function BudgetSection({
  year,
  month,
  categories,
  budgets,
  spent,
  onSetBudget,
}: BudgetSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Budget &mdash; {monthLabel(year, month)}</h2>
      {categories.map(category => (
        <BudgetRow
          key={category}
          category={category}
          budgetAmount={budgets[category] ?? 0}
          spentAmount={spent[category] ?? 0}
          onSetBudget={onSetBudget}
        />
      ))}
    </section>
  );
}
