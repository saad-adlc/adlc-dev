import { useState } from 'react';
import InputForm, { type LeaseBuyInputs } from './components/input-form';
import ResultsPanel from './components/results-panel';
import {
  calculateMonthlyLoanPayment,
  calculateTotalLeaseCost,
  calculateTotalBuyCost,
} from './utils/calculations';
import './app.css';

const INITIAL_INPUTS: LeaseBuyInputs = {
  assetCost: 0,
  downPayment: 0,
  termMonths: 0,
  monthlyLeasePayment: 0,
  annualLoanRate: 0,
  residualValue: 0,
};

/** Returns true when all required inputs are positive / non-zero. */
function isValidInput(inputs: LeaseBuyInputs): boolean {
  return (
    inputs.assetCost > 0 &&
    inputs.termMonths > 0 &&
    inputs.monthlyLeasePayment > 0 &&
    inputs.annualLoanRate >= 0 &&
    inputs.downPayment >= 0 &&
    inputs.residualValue >= 0 &&
    inputs.downPayment < inputs.assetCost
  );
}

/**
 * Root application component for the Lease vs Buy Comparison tool.
 */
export default function App() {
  const [inputs, setInputs] = useState<LeaseBuyInputs>(INITIAL_INPUTS);

  const handleChange = (field: keyof LeaseBuyInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const valid = isValidInput(inputs);
  const principal = inputs.assetCost - inputs.downPayment;
  const monthlyLoanPayment = valid
    ? calculateMonthlyLoanPayment(principal, inputs.annualLoanRate, inputs.termMonths)
    : 0;
  const totalLeaseCost = valid
    ? calculateTotalLeaseCost(inputs.monthlyLeasePayment, inputs.termMonths)
    : 0;
  const totalBuyCost = valid
    ? calculateTotalBuyCost(monthlyLoanPayment, inputs.termMonths, inputs.downPayment, inputs.residualValue)
    : 0;

  return (
    <div id="app" className="app">
      <header className="app__header">
        <h1>Lease vs Buy Comparison</h1>
        <p className="app__subtitle">Compare the true cost of leasing versus buying an asset over the same period.</p>
      </header>
      <main className="app__main">
        <section className="app__inputs" aria-label="Input parameters">
          <h2>Parameters</h2>
          <InputForm values={inputs} onChange={handleChange} />
        </section>
        <section className="app__results" aria-label="Comparison results">
          <h2>Results</h2>
          <ResultsPanel
            monthlyLeasePayment={inputs.monthlyLeasePayment}
            monthlyLoanPayment={monthlyLoanPayment}
            totalLeaseCost={totalLeaseCost}
            totalBuyCost={totalBuyCost}
            isValid={valid}
          />
        </section>
      </main>
    </div>
  );
}
