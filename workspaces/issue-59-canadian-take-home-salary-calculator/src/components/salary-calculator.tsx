import { useState } from 'react';
import { calculateTakeHome } from '../lib/tax-calculator';
import { formatCurrency } from '../lib/format';
import SalaryInput from './salary-input';
import ResultCards from './results-cards';
import TaxBreakdownTable from './tax-breakdown-table';
import styles from './salary-calculator.module.css';

type InputMode = 'hourly' | 'yearly';

const HOURS_PER_YEAR = 2080;
const MAX_REASONABLE_YEARLY = 10_000_000;

/** Parses the raw input string to a yearly income value, or null if blank/invalid. */
function parseYearlyIncome(value: string, mode: InputMode): number | null {
  if (value === '') return null;
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return null;
  return mode === 'hourly' ? parsed * HOURS_PER_YEAR : parsed;
}

/** Returns a validation error message for negative income, or null. */
function getError(yearlyIncome: number | null): string | null {
  if (yearlyIncome !== null && yearlyIncome < 0) return 'Please enter a positive value.';
  return null;
}

/** Returns a warning for unusually large income, or null. */
function getWarning(yearlyIncome: number | null): string | null {
  if (yearlyIncome !== null && yearlyIncome > MAX_REASONABLE_YEARLY) {
    return 'This value seems unusually large.';
  }
  return null;
}

/** Builds the equivalent-value display string shown below the primary input. */
function buildEquivalentDisplay(yearlyIncome: number | null, mode: InputMode): string | null {
  if (yearlyIncome === null || yearlyIncome < 0) return null;
  if (mode === 'yearly') {
    return `Hourly equivalent: ${formatCurrency(yearlyIncome / HOURS_PER_YEAR)}/hr`;
  }
  return `Yearly equivalent: ${formatCurrency(yearlyIncome)}/yr`;
}

/** Canadian take-home salary calculator (2024, Ontario). */
export default function SalaryCalculator() {
  const [mode, setMode] = useState<InputMode>('yearly');
  const [inputValue, setInputValue] = useState('');

  const yearlyIncome = parseYearlyIncome(inputValue, mode);
  const error = getError(yearlyIncome);
  const warning = getWarning(yearlyIncome);
  const showResults = yearlyIncome !== null && yearlyIncome >= 0;
  const result = showResults ? calculateTakeHome(yearlyIncome) : null;
  const equivalentDisplay = buildEquivalentDisplay(yearlyIncome, mode);

  function handleModeChange(newMode: InputMode): void {
    if (inputValue !== '' && newMode !== mode) {
      const val = parseFloat(inputValue);
      if (!isNaN(val)) {
        const converted =
          newMode === 'hourly'
            ? (val / HOURS_PER_YEAR).toFixed(2)
            : (val * HOURS_PER_YEAR).toFixed(2);
        setInputValue(converted);
      }
    }
    setMode(newMode);
  }

  return (
    <div className={styles.calculator}>
      <h1 className={styles.title}>Canadian Take-Home Salary Calculator</h1>
      <p className={styles.subtitle}>2024 · Ontario · Federal + Provincial Tax + CPP + EI</p>
      <SalaryInput
        mode={mode}
        inputValue={inputValue}
        equivalentDisplay={equivalentDisplay}
        onModeChange={handleModeChange}
        onChange={setInputValue}
      />
      {error !== null && (
        <p role="alert" className={styles.error}>{error}</p>
      )}
      {warning !== null && (
        <p className={styles.warning}>{warning}</p>
      )}
      {result !== null && (
        <>
          <ResultCards result={result} />
          <TaxBreakdownTable breakdown={result.breakdown} effectiveTaxRate={result.effectiveTaxRate} />
        </>
      )}
    </div>
  );
}
