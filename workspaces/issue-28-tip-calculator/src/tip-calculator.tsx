import { useState } from 'react';
import styles from './tip-calculator.module.css';

const TIP_PERCENTAGES = [10, 15, 20, 25] as const;

/**
 * Formats a number as a dollar string with exactly two decimal places.
 * @example formatCurrency(12.5) // '$12.50'
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculates the total bill amount including the given tip percentage.
 * @example calculateTotal(100, 20) // 120
 */
export function calculateTotal(bill: number, tipPercent: number): number {
  return bill * (1 + tipPercent / 100);
}

/** Real-time tip calculator — bill input + preset tip buttons → formatted total. */
export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState('');
  const [selectedTip, setSelectedTip] = useState<number | null>(null);

  const billNum = parseFloat(billAmount);
  const bill = isNaN(billNum) ? 0 : billNum;
  const total = selectedTip !== null ? calculateTotal(bill, selectedTip) : 0;

  function handleClear() {
    setBillAmount('');
    setSelectedTip(null);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tip Calculator</h1>

      <div className={styles.field}>
        <label htmlFor="bill-amount">Bill amount</label>
        <input
          id="bill-amount"
          type="number"
          value={billAmount}
          onChange={(e) => setBillAmount(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.tipSection}>
        <p className={styles.tipLabel}>Select tip percentage</p>
        <div className={styles.tipGrid}>
          {TIP_PERCENTAGES.map((pct) => (
            <button
              key={pct}
              className={`${styles.tipButton}${selectedTip === pct ? ` ${styles.selected}` : ''}`}
              onClick={() => setSelectedTip(pct)}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      <div className={styles.totalCard}>
        <p className={styles.totalLabel}>Total</p>
        <p className={styles.totalAmount}>{formatCurrency(total)}</p>
      </div>

      <button className={styles.clearButton} onClick={handleClear}>
        Clear
      </button>
    </div>
  );
}
