import { useState } from 'react';
import CalculatorForm from './components/calculator-form';
import ResultsCard from './components/results-card';
import { calcTaxSavings, TaxSavingsResult } from './utils/tax-calculations';
import { FilingStatus } from './constants/tax2025';
import './app.css';

/**
 * App — root component for the US Self-Employed Tax Savings Calculator.
 * Owns all form state and derives results on every input change.
 */
export default function App() {
  const [grossIncome, setGrossIncome] = useState<number>(0);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [state, setState] = useState<string>('');
  const [dependents, setDependents] = useState<number>(0);

  const result: TaxSavingsResult | null =
    grossIncome > 0
      ? calcTaxSavings(grossIncome, filingStatus, dependents)
      : null;

  return (
    <main className="app">
      <header className="app-header">
        <h1>US Self-Employed Tax Savings Calculator</h1>
        <p className="app-subtitle">2025 Federal Tax Year</p>
      </header>

      <div className="app-layout">
        <CalculatorForm
          grossIncome={grossIncome}
          filingStatus={filingStatus}
          state={state}
          dependents={dependents}
          onGrossIncomeChange={setGrossIncome}
          onFilingStatusChange={setFilingStatus}
          onStateChange={setState}
          onDependentsChange={setDependents}
        />
        <ResultsCard result={result} />
      </div>
    </main>
  );
}
