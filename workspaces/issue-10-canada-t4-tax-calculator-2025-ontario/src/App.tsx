import { useState } from 'react';
import InputPanel from './components/input-panel';
import ResultsPanel from './components/results-panel';
import { calculateTaxResult, type TaxResult } from './utils/tax-calc';
import styles from './app.module.css';

/** App — root component, mounts the T4 tax calculator. */
export default function App() {
  const [result, setResult] = useState<TaxResult | null>(null);

  function handleGrossChange(gross: number | null) {
    setResult(gross !== null ? calculateTaxResult(gross) : null);
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Canada T4 Tax Calculator</h1>
        <p className={styles.subtitle}>2025 tax year — Ontario</p>
      </header>
      <main className={styles.layout}>
        <InputPanel onGrossChange={handleGrossChange} />
        {result ? (
          <ResultsPanel result={result} />
        ) : (
          <p className={styles.placeholder}>Enter your income above to see your tax breakdown.</p>
        )}
      </main>
    </div>
  );
}
