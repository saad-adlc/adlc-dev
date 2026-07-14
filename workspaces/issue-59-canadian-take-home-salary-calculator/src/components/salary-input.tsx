import styles from './salary-input.module.css';

type InputMode = 'hourly' | 'yearly';

interface SalaryInputProps {
  mode: InputMode;
  inputValue: string;
  equivalentDisplay: string | null;
  onModeChange: (mode: InputMode) => void;
  onChange: (value: string) => void;
}

/** Salary input section: hourly/yearly toggle, labeled number field, equivalent display. */
export default function SalaryInput({
  mode,
  inputValue,
  equivalentDisplay,
  onModeChange,
  onChange,
}: SalaryInputProps) {
  const labelText = mode === 'yearly' ? 'Yearly salary' : 'Hourly salary';

  return (
    <div className={styles.inputSection}>
      <div className={styles.toggle} role="group" aria-label="Input mode">
        <button
          type="button"
          aria-pressed={mode === 'hourly'}
          className={mode === 'hourly' ? styles.toggleActive : styles.toggleBtn}
          onClick={() => onModeChange('hourly')}
        >
          Hourly
        </button>
        <button
          type="button"
          aria-pressed={mode === 'yearly'}
          className={mode === 'yearly' ? styles.toggleActive : styles.toggleBtn}
          onClick={() => onModeChange('yearly')}
        >
          Yearly
        </button>
      </div>
      <div className={styles.field}>
        <label htmlFor="salary-input" className={styles.label}>
          {labelText}
        </label>
        <input
          id="salary-input"
          type="number"
          value={inputValue}
          onChange={e => onChange(e.target.value)}
          className={styles.input}
          placeholder="0"
        />
      </div>
      {equivalentDisplay !== null && (
        <p className={styles.equivalent}>{equivalentDisplay}</p>
      )}
    </div>
  );
}
