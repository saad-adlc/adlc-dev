import { useTrackerStore } from './use-tracker-store';
import { filterByMonth, totalIncome, totalExpenses, spentByCategory, monthKey } from './utils';
import { DEFAULT_CATEGORIES } from './constants';
import HeaderBar from './components/header-bar';
import SummaryCards from './components/summary-cards';
import BudgetSection from './components/budget-section';
import AddTransactionForm from './components/add-transaction-form';
import TransactionList from './components/transaction-list';
import styles from './App.module.css';

/** Root application component — composes all feature sections. */
export default function App() {
  const {
    transactions,
    budgets,
    currentYear,
    currentMonth,
    addTransaction,
    deleteTransaction,
    setBudget,
    navigateMonth,
  } = useTrackerStore();

  const monthTransactions = filterByMonth(transactions, currentYear, currentMonth);
  const income = totalIncome(monthTransactions);
  const expenses = totalExpenses(monthTransactions);
  const balance = income - expenses;
  const spent = spentByCategory(monthTransactions);
  const monthBudgets = budgets[monthKey(currentYear, currentMonth)] ?? {};

  return (
    <div className={styles.app}>
      <HeaderBar
        year={currentYear}
        month={currentMonth}
        onPrev={() => navigateMonth('prev')}
        onNext={() => navigateMonth('next')}
      />
      <main className={styles.main}>
        <SummaryCards income={income} expenses={expenses} balance={balance} />
        <BudgetSection
          year={currentYear}
          month={currentMonth}
          categories={DEFAULT_CATEGORIES}
          budgets={monthBudgets}
          spent={spent}
          onSetBudget={setBudget}
        />
        <AddTransactionForm categories={DEFAULT_CATEGORIES} onAdd={addTransaction} />
        <TransactionList
          year={currentYear}
          month={currentMonth}
          transactions={monthTransactions}
          onDelete={deleteTransaction}
        />
      </main>
    </div>
  );
}
