import { useState } from 'react';
import { useExpenseStore } from '../use-expense-store';
import Dashboard from './dashboard';
import ExpenseListTab from './expense-list-tab';
import styles from '../app.module.css';

type Tab = 'dashboard' | 'expense-list';

/** Root expense tracker component — manages tab state and wires the store. */
export default function ExpenseTracker() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const store = useExpenseStore();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1>Expense Tracker</h1>
        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'dashboard' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'expense-list' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('expense-list')}
          >
            Expense List
          </button>
        </nav>
      </header>

      {activeTab === 'dashboard' ? (
        <Dashboard
          expenses={store.expenses}
          categories={store.categories}
          activeFilter={store.activeFilter}
          filteredExpenses={store.filteredExpenses}
          onAdd={store.addExpense}
          onDelete={store.deleteExpense}
          onFilterChange={store.setFilter}
          onAddCategory={store.addCategory}
          onRenameCategory={store.renameCategory}
          onDeleteCategory={store.deleteCategory}
        />
      ) : (
        <ExpenseListTab
          expenses={store.expenses}
          categories={store.categories}
          activeFilter={store.activeFilter}
          filteredExpenses={store.filteredExpenses}
          onAdd={store.addExpense}
          onDelete={store.deleteExpense}
          onFilterChange={store.setFilter}
          onAddCategory={store.addCategory}
          onRenameCategory={store.renameCategory}
          onDeleteCategory={store.deleteCategory}
        />
      )}
    </div>
  );
}
