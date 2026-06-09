import { useState } from 'react';
import { calculateGrossFromHourly } from '../utils/tax-calc';
import styles from './input-panel.module.css';

type InputMode = 'annual' | 'hourly';

interface InputPanelProps {
  onGrossChange: (gross: number | null) => void;
}

function parsePositive(raw: string): number | null {
  const n = parseFloat(raw);
  return isFinite(n) && n > 0 ? n : null;
}

function computeGross(mode: InputMode, annual: string, rate: string, hours: string): number | null {
  if (mode === 'annual') {
    return parsePositive(annual);
  }
  const r = parsePositive(rate);
  const h = parsePositive(hours);
  if (r === null || h === null) return null;
  return calculateGrossFromHourly(r, h);
}

/** InputPanel — mode toggle and validated salary / hourly inputs. */
export default function InputPanel({ onGrossChange }: InputPanelProps) {
  const [mode, setMode] = useState<InputMode>('annual');
  const [annualSalary, setAnnualSalary] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');

  function handleModeChange(next: InputMode) {
    setMode(next);
    onGrossChange(computeGross(next, annualSalary, hourlyRate, hoursPerWeek));
  }

  function handleAnnualChange(value: string) {
    setAnnualSalary(value);
    onGrossChange(computeGross('annual', value, hourlyRate, hoursPerWeek));
  }

  function handleRateChange(value: string) {
    setHourlyRate(value);
    onGrossChange(computeGross('hourly', annualSalary, value, hoursPerWeek));
  }

  function handleHoursChange(value: string) {
    setHoursPerWeek(value);
    onGrossChange(computeGross('hourly', annualSalary, hourlyRate, value));
  }

  const annualInvalid = annualSalary !== '' && parsePositive(annualSalary) === null;
  const rateInvalid = hourlyRate !== '' && parsePositive(hourlyRate) === null;
  const hoursInvalid = hoursPerWeek !== '' && parsePositive(hoursPerWeek) === null;

  return (
    <section className={styles.panel} aria-label="Income input">
      <div className={styles.toggle} role="group" aria-label="Input mode">
        <button
          type="button"
          className={mode === 'annual' ? styles.activeTab : styles.tab}
          onClick={() => handleModeChange('annual')}
          aria-pressed={mode === 'annual'}
        >
          Annual Salary
        </button>
        <button
          type="button"
          className={mode === 'hourly' ? styles.activeTab : styles.tab}
          onClick={() => handleModeChange('hourly')}
          aria-pressed={mode === 'hourly'}
        >
          Hourly Rate
        </button>
      </div>

      {mode === 'annual' && (
        <div className={styles.field}>
          <label htmlFor="annual-salary">Annual Salary ($)</label>
          <input
            id="annual-salary"
            type="number"
            min="0.01"
            step="1"
            value={annualSalary}
            onChange={(e) => handleAnnualChange(e.target.value)}
            placeholder="e.g. 75000"
            aria-invalid={annualInvalid}
          />
          {annualInvalid && (
            <span className={styles.error}>Enter a positive annual salary.</span>
          )}
        </div>
      )}

      {mode === 'hourly' && (
        <>
          <div className={styles.field}>
            <label htmlFor="hourly-rate">Hourly Rate ($/hr)</label>
            <input
              id="hourly-rate"
              type="number"
              min="0.01"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => handleRateChange(e.target.value)}
              placeholder="e.g. 25.00"
              aria-invalid={rateInvalid}
            />
            {rateInvalid && (
              <span className={styles.error}>Enter a positive hourly rate.</span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="hours-per-week">Hours per Week</label>
            <input
              id="hours-per-week"
              type="number"
              min="0.5"
              step="0.5"
              value={hoursPerWeek}
              onChange={(e) => handleHoursChange(e.target.value)}
              placeholder="e.g. 40"
              aria-invalid={hoursInvalid}
            />
            {hoursInvalid && (
              <span className={styles.error}>Enter a positive number of hours per week.</span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
