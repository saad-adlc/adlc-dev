import type { Category, Expense } from '../types';
import AddExpenseForm from './add-expense-form';
import CategoryManager from './category-manager';
import ExpenseTable from './expense-table';
import styles from '../app.module.css';

interface ExpenseListTabProps {
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

/** Expense List tab: full-width table, add form, category manager. */
export default function ExpenseListTab({
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
}: ExpenseListTabProps) {
  return (
    <div>
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
