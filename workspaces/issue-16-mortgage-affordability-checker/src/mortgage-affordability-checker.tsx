import { useState } from 'react';
import styles from './mortgage-affordability-checker.module.css';
import {
  validateInputs,
  runAffordabilityCheck,
  AffordabilityResult,
  ValidationErrors,
  VerdictLabel,
} from './mortgage-calculator';

interface FormValues {
  houseValue: string;
  downPayment: string;
  annualIncome: string;
  creditScore: string;
}

const INITIAL_FORM: FormValues = {
  houseValue: '',
  downPayment: '',
  annualIncome: '',
  creditScore: '',
};

const VERDICT_CLASS: Record<VerdictLabel, string> = {
  'Likely approved': styles.verdictLikelyApproved,
  Borderline: styles.verdictBorderline,
  Unlikely: styles.verdictUnlikely,
  'Not eligible': styles.verdictNotEligible,
};

/** Formats a number as a Canadian dollar amount with no decimals. */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Input field with label, optional helper text, and inline error. */
function InputField({
  id,
  label,
  helperText,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  helperText?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const inputClass = [styles.input, error ? styles.inputError : ''].filter(Boolean).join(' ');
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {helperText && <p className={styles.helperText}>{helperText}</p>}
      <input
        id={id}
        type="number"
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}

/** Result cards and explanation strip, rendered only after a valid check. */
function AffordabilityResults({ result }: { result: AffordabilityResult }) {
  return (
    <>
      <div className={styles.resultsRow}>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Approval likelihood</p>
          <p className={styles.metricValue}>{result.likelihood}%</p>
          <span className={`${styles.verdictBadge} ${VERDICT_CLASS[result.verdict]}`}>
            {result.verdict}
          </span>
        </div>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Estimated monthly payment</p>
          <p className={styles.metricValue}>{formatCurrency(result.monthlyPayment)}</p>
          <p className={styles.metricSubtext}>5% rate · 25 years</p>
        </div>
      </div>
      <div className={styles.explanationStrip}>
        <p className={styles.explanationText}>{result.explanation}</p>
      </div>
    </>
  );
}

/** Mortgage Affordability Checker — single-page calculator. */
export default function MortgageAffordabilityChecker() {
  const [form, setForm] = useState<FormValues>(INITIAL_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<AffordabilityResult | null>(null);

  function handleChange(field: keyof FormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const houseValue = parseFloat(form.houseValue);
    const downPayment = parseFloat(form.downPayment);
    const annualIncome = parseFloat(form.annualIncome);
    const creditScore = parseFloat(form.creditScore);

    const validationErrors = validateInputs(houseValue, downPayment, annualIncome, creditScore);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setResult(null);
      return;
    }

    setErrors({});
    setResult(runAffordabilityCheck(houseValue, downPayment, annualIncome, creditScore));
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Mortgage affordability checker</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.inputCard}>
          <InputField
            id="houseValue"
            label="House value ($)"
            value={form.houseValue}
            error={errors.houseValue}
            onChange={(v) => handleChange('houseValue', v)}
          />
          <InputField
            id="downPayment"
            label="Down payment ($)"
            value={form.downPayment}
            error={errors.downPayment}
            onChange={(v) => handleChange('downPayment', v)}
          />
          <InputField
            id="annualIncome"
            label="Annual gross income ($)"
            value={form.annualIncome}
            error={errors.annualIncome}
            onChange={(v) => handleChange('annualIncome', v)}
          />
          <InputField
            id="creditScore"
            label="Credit score (300–900)"
            helperText="Below 600 is automatically not eligible"
            value={form.creditScore}
            error={errors.creditScore}
            onChange={(v) => handleChange('creditScore', v)}
          />
          <button type="submit" className={styles.submitButton}>
            Check affordability
          </button>
        </div>
      </form>

      {result && <AffordabilityResults result={result} />}
    </main>
  );
}
