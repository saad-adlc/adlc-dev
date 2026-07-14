import { useState } from 'react';
import {
  calculateMonthlyRate,
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  validateInputs,
  needsCmhcInsurance,
  formatCAD,
  PAYMENTS_PER_YEAR,
  DEFAULT_RATE,
  DEFAULT_DOWN_PERCENT,
  DEFAULT_AMORTIZATION_YEARS,
  MIN_TERM_YEARS,
  MAX_TERM_YEARS,
} from './mortgage-utils';
import AmortizationTable from './amortization-table';
import styles from './mortgage-calculator.module.css';

const AMORTIZATION_OPTIONS = Array.from(
  { length: MAX_TERM_YEARS - MIN_TERM_YEARS + 1 },
  (_, i) => i + MIN_TERM_YEARS,
);

/** Canadian mortgage calculator with semi-annual compounding. */
export default function MortgageCalculator() {
  const [homePriceStr, setHomePriceStr] = useState('');
  const [downPctStr, setDownPctStr] = useState(String(DEFAULT_DOWN_PERCENT));
  const [downAmtStr, setDownAmtStr] = useState('');
  const [rateStr, setRateStr] = useState(DEFAULT_RATE.toFixed(2));
  const [amortizationYears, setAmortizationYears] = useState(DEFAULT_AMORTIZATION_YEARS);

  const homePrice = parseFloat(homePriceStr);
  const downAmt = parseFloat(downAmtStr);
  const rate = parseFloat(rateStr);
  const isFormFilled = homePriceStr.trim() !== '';

  const validationError = isFormFilled
    ? validateInputs(homePrice, downAmt, rate, amortizationYears)
    : null;

  const showCmhc =
    isFormFilled && !validationError && needsCmhcInsurance(homePrice, downAmt);

  let mortgageAmount = 0;
  let monthlyPayment = 0;
  let totalInterest = 0;
  let schedule: ReturnType<typeof generateAmortizationSchedule> = [];

  if (isFormFilled && !validationError) {
    const principal = homePrice - downAmt;
    const monthlyRate = calculateMonthlyRate(rate);
    const totalPayments = amortizationYears * PAYMENTS_PER_YEAR;
    mortgageAmount = principal;
    monthlyPayment = calculateMonthlyPayment(principal, monthlyRate, totalPayments);
    totalInterest = monthlyPayment * totalPayments - principal;
    schedule = generateAmortizationSchedule(principal, monthlyRate, amortizationYears);
  }

  function handlePriceChange(val: string) {
    setHomePriceStr(val);
    const price = parseFloat(val);
    const pct = parseFloat(downPctStr);
    if (isFinite(price) && price > 0 && isFinite(pct)) {
      setDownAmtStr((price * (pct / 100)).toFixed(2));
    } else {
      setDownAmtStr('');
    }
  }

  function handleDownPctChange(val: string) {
    setDownPctStr(val);
    const price = parseFloat(homePriceStr);
    const pct = parseFloat(val);
    if (isFinite(price) && price > 0 && isFinite(pct)) {
      setDownAmtStr((price * (pct / 100)).toFixed(2));
    }
  }

  function handleDownAmtChange(val: string) {
    setDownAmtStr(val);
    const price = parseFloat(homePriceStr);
    const amt = parseFloat(val);
    if (isFinite(price) && price > 0 && isFinite(amt)) {
      setDownPctStr(((amt / price) * 100).toFixed(2));
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Canadian Mortgage Calculator</h1>

      <section className={styles.form} aria-label="Mortgage inputs">
        <div className={styles.field}>
          <label htmlFor="home-price">Home Price (CAD)</label>
          <input
            id="home-price"
            type="number"
            min={0}
            step={1000}
            placeholder="e.g. 500000"
            value={homePriceStr}
            onChange={e => handlePriceChange(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Down Payment</label>
          <div className={styles.downPayment}>
            <input
              id="down-pct"
              type="number"
              min={0}
              max={99.99}
              step={0.01}
              aria-label="Down payment percent"
              value={downPctStr}
              onChange={e => handleDownPctChange(e.target.value)}
            />
            <span className={styles.unit}>%</span>
            <input
              id="down-amt"
              type="number"
              min={0}
              step={1000}
              aria-label="Down payment amount"
              value={downAmtStr}
              onChange={e => handleDownAmtChange(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="rate">Interest Rate (%)</label>
          <input
            id="rate"
            type="number"
            min={0.01}
            max={25}
            step={0.01}
            value={rateStr}
            onChange={e => setRateStr(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="amortization">Amortization Period</label>
          <select
            id="amortization"
            value={amortizationYears}
            onChange={e => setAmortizationYears(Number(e.target.value))}
          >
            {AMORTIZATION_OPTIONS.map(yr => (
              <option key={yr} value={yr}>
                {yr} years
              </option>
            ))}
          </select>
        </div>
      </section>

      {isFormFilled && validationError && (
        <div className={styles.error} role="alert">
          {validationError.message}
        </div>
      )}

      {isFormFilled && !validationError && (
        <>
          {showCmhc && (
            <div className={styles.notice} role="note">
              A down payment below 20% would require CMHC mortgage insurance (not calculated here).
            </div>
          )}

          <section className={styles.results} aria-label="Mortgage results">
            <div className={styles.resultCard}>
              <span className={styles.label}>Mortgage Amount</span>
              <strong className={styles.value}>{formatCAD(mortgageAmount)}</strong>
            </div>
            <div className={styles.resultCard}>
              <span className={styles.label}>Monthly Payment</span>
              <strong className={styles.value}>{formatCAD(monthlyPayment)}</strong>
            </div>
            <div className={styles.resultCard}>
              <span className={styles.label}>Total Interest</span>
              <strong className={styles.value}>{formatCAD(totalInterest)}</strong>
            </div>
          </section>

          <AmortizationTable schedule={schedule} />
        </>
      )}
    </div>
  );
}
