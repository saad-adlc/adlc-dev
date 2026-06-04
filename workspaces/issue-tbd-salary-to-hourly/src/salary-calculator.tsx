import { useState } from 'react';

/** Hours in a standard working day */
const HOURS_PER_DAY = 8;

/** Months in a year */
const MONTHS_PER_YEAR = 12;

interface Rates {
  hourly: number;
  daily: number;
  weekly: number;
  monthly: number;
}

/**
 * Calculates hourly, daily, weekly, and monthly rates from an annual salary.
 * Returns zero for all rates when inputs are invalid or zero.
 */
export function calculateRates(
  annualSalary: number,
  hoursPerWeek: number,
  weeksPerYear: number,
): Rates {
  const totalHours = hoursPerWeek * weeksPerYear;
  if (totalHours === 0 || annualSalary <= 0) {
    return { hourly: 0, daily: 0, weekly: 0, monthly: 0 };
  }
  const hourly = annualSalary / totalHours;
  return {
    hourly,
    daily: hourly * HOURS_PER_DAY,
    weekly: hourly * hoursPerWeek,
    monthly: annualSalary / MONTHS_PER_YEAR,
  };
}

/** Formats a number as a USD dollar string with two decimal places. */
function fmt(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const styles = {
  wrapper: { fontFamily: 'sans-serif', maxWidth: 320, margin: '2rem auto', padding: '1.5rem', border: '1px solid #ddd', borderRadius: 8 } as const,
  heading: { margin: '0 0 1rem', fontSize: '1.1rem' } as const,
  field: { display: 'flex', flexDirection: 'column' as const, marginBottom: '0.75rem', gap: 4 },
  label: { fontSize: '0.8rem', color: '#555' } as const,
  input: { padding: '0.35rem 0.5rem', fontSize: '0.95rem', border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' as const },
  divider: { margin: '1rem 0 0.75rem', borderColor: '#eee' } as const,
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' } as const,
  rateLabel: { color: '#555' } as const,
  rateValue: { fontWeight: 600 } as const,
};

/**
 * Standalone salary-to-hourly rate calculator.
 * Updates all four output rates live as inputs change.
 */
export default function SalaryCalculator() {
  const [salary, setSalary] = useState('');
  const [hours, setHours] = useState(40);
  const [weeks, setWeeks] = useState(52);

  const rates = calculateRates(parseFloat(salary) || 0, hours, weeks);

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Salary Calculator</h2>

      <div style={styles.field}>
        <label htmlFor="salary" style={styles.label}>Annual Salary ($)</label>
        <input
          id="salary"
          type="number"
          min={0}
          placeholder="e.g. 75000"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="hours" style={styles.label}>Hours / Week</label>
        <input
          id="hours"
          type="number"
          min={1}
          max={168}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="weeks" style={styles.label}>Weeks / Year</label>
        <input
          id="weeks"
          type="number"
          min={1}
          max={52}
          value={weeks}
          onChange={(e) => setWeeks(Number(e.target.value))}
          style={styles.input}
        />
      </div>

      <hr style={styles.divider} />

      {(
        [
          ['Hourly', 'hourly'],
          ['Daily', 'daily'],
          ['Weekly', 'weekly'],
          ['Monthly', 'monthly'],
        ] as [string, keyof Rates][]
      ).map(([label, key]) => (
        <div key={key} style={styles.row}>
          <span style={styles.rateLabel}>{label}</span>
          <span style={styles.rateValue} data-testid={`rate-${key}`}>
            {fmt(rates[key])}
          </span>
        </div>
      ))}
    </div>
  );
}
