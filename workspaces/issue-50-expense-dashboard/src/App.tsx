import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './nav-bar';
import OverviewPage from './overview-page';
import TransactionsPage from './transactions-page';
import { EXPENSES } from './expenses';
import styles from './App.module.css';

/** Root application with client-side routing between Overview and Transactions. */
export default function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <NavBar />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage expenses={EXPENSES} />} />
            <Route
              path="/transactions"
              element={<TransactionsPage expenses={EXPENSES} />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
