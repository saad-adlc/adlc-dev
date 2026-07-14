import { useState } from 'react';
import {
  calculateProfit,
  formatCurrency,
  formatPercentage,
  parseNumericInput,
} from './profit-calculator-utils';
import styles from './profit-calculator.module.css';

const NUMERIC_PATTERN = /^\d*\.?\d*$/;

function getProfitClass(value: number): string {
  if (value > 0) return styles.profit;
  if (value < 0) return styles.loss;
  return styles.neutral;
}

/** Returns a change handler that filters input to digits and one decimal point. */
function makeNumericHandler(
  setter: React.Dispatch<React.SetStateAction<string>>,
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || NUMERIC_PATTERN.test(val)) {
      setter(val);
    }
  };
}

/** Single-page profit percentage calculator. */
export default function ProfitCalculator() {
  const [costInput, setCostInput] = useState('');
  const [sellingInput, setSellingInput] = useState('');

  const costPrice = parseNumericInput(costInput);
  const sellingPrice = parseNumericInput(sellingInput);

  const result =
    costPrice !== null && costPrice > 0 && sellingPrice !== null
      ? calculateProfit(costPrice, sellingPrice)
      : null;

  function handleClear() {
    setCostInput('');
    setSellingInput('');
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profit Calculator</h1>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="cost-input">
          Cost Price ($)
        </label>
        <input
          id="cost-input"
          className={styles.input}
          type="text"
          inputMode="decimal"
          value={costInput}
          onChange={makeNumericHandler(setCostInput)}
          placeholder="0.00"
          aria-label="Cost price"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="selling-input">
          Selling Price ($)
        </label>
        <input
          id="selling-input"
          className={styles.input}
          type="text"
          inputMode="decimal"
          value={sellingInput}
          onChange={makeNumericHandler(setSellingInput)}
          placeholder="0.00"
          aria-label="Selling price"
        />
      </div>

      <button
        className={styles.clearButton}
        onClick={handleClear}
        type="button"
      >
        Clear
      </button>

      <div className={styles.resultSection}>
        {result === null ? (
          <p className={styles.prompt}>Enter a cost price to calculate</p>
        ) : (
          <>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Profit %</span>
              <span
                className={`${styles.resultValue} ${getProfitClass(result.profitPercentage)}`}
              >
                {result.profitPercentage < 0 ? '−' : ''}
                {formatPercentage(result.profitPercentage)}
                {result.profitPercentage < 0 && (
                  <span className={styles.lossLabel}> loss</span>
                )}
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Profit Amount</span>
              <span
                className={`${styles.resultValue} ${getProfitClass(result.profitAmount)}`}
              >
                {formatCurrency(result.profitAmount)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
