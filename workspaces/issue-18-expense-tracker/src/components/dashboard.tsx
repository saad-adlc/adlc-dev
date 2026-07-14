import { buildCategorySlices, buildDailySpend, sumExpenses, topCategory } from '../chart-data';
import type { Category, Expense } from '../types';
import AddExpenseForm from './add-expense-form';
import CategoryManager from './category-manager';
import DonutChart from './donut-chart';
import ExpenseTable from './expense-table';
import LineChart from './line-chart';
import SummaryCards from './summary-cards';
import styles from '../app.module.css';

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  activeFilter: string;
  filteredExpenses: Expense[];
  onAdd: (draft: Omit<Expense, 'id'>) => void;
  onDelete: (id: string) => void;
  onFilterChange: (filter: string) => void;
  onAddCategory: (name: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}

/** Dashboard tab: summary cards, category filter, charts, form, table. */
export default function Dashboard({
  expenses,
  categories,
  activeFilter,
  filteredExpenses,
  onAdd,
  onDelete,
  onFilterChange,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: DashboardProps) {
  const total = sumExpenses(filteredExpenses);
  const top = topCategory(filteredExpenses);
  const slices = buildCategorySlices(filteredExpenses);
  const daily = buildDailySpend(filteredExpenses);

  return (
    <div>
      <SummaryCards total={total} count={filteredExpenses.length} topCategory={top} />

      <div className={styles.filterRow}>
        <select
          value={activeFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartPanel}>
          <p className={styles.chartTitle}>Spending by category</p>
          <DonutChart slices={slices} />
        </div>
        <div className={styles.chartPanel}>
          <p className={styles.chartTitle}>Daily spending</p>
          <LineChart data={daily} />
        </div>
      </div>

      <p className={styles.sectionTitle}>Add expense</p>
      <AddExpenseForm categories={categories} onAdd={onAdd} />

      <ExpenseTable
        expenses={expenses}
        filteredExpenses={filteredExpenses}
        activeFilter={activeFilter}
        onDelete={onDelete}
      />

      <CategoryManager
        categories={categories}
        expenses={expenses}
        onAdd={onAddCategory}
        onRename={onRenameCategory}
        onDelete={onDeleteCategory}
      />
    </div>
  );
}
