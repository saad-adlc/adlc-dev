import { FilingStatus } from '../constants/tax2025';

/** Props for CalculatorForm */
export interface CalculatorFormProps {
  grossIncome: number;
  filingStatus: FilingStatus;
  state: string;
  dependents: number;
  onGrossIncomeChange: (value: number) => void;
  onFilingStatusChange: (value: FilingStatus) => void;
  onStateChange: (value: string) => void;
  onDependentsChange: (value: number) => void;
}

/** All 50 US states plus DC */
const US_STATES: string[] = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  mfj: 'Married Filing Jointly',
  mfs: 'Married Filing Separately',
  hoh: 'Head of Household',
};

/** Max allowed income value */
const MAX_INCOME = 10_000_000;
/** Max allowed dependents */
const MAX_DEPENDENTS = 20;

/**
 * CalculatorForm — collects user inputs for the tax savings calculator.
 * All inputs are controlled; results update on every change.
 */
export default function CalculatorForm({
  grossIncome,
  filingStatus,
  state,
  dependents,
  onGrossIncomeChange,
  onFilingStatusChange,
  onStateChange,
  onDependentsChange,
}: CalculatorFormProps) {
  function handleIncomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseFloat(e.target.value);
    if (isNaN(raw) || raw < 0) {
      onGrossIncomeChange(0);
      return;
    }
    onGrossIncomeChange(Math.min(raw, MAX_INCOME));
  }

  function handleDependentsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseInt(e.target.value, 10);
    if (isNaN(raw) || raw < 0) {
      onDependentsChange(0);
      return;
    }
    onDependentsChange(Math.min(raw, MAX_DEPENDENTS));
  }

  return (
    <div className="calculator-form">
      <h2>Your Information</h2>

      <div className="form-field">
        <label htmlFor="gross-income">Gross Self-Employment Income ($)</label>
        <input
          id="gross-income"
          type="number"
          min={0}
          max={MAX_INCOME}
          step={1000}
          value={grossIncome || ''}
          onChange={handleIncomeChange}
          placeholder="e.g. 80000"
        />
      </div>

      <div className="form-field">
        <label htmlFor="filing-status">Filing Status</label>
        <select
          id="filing-status"
          value={filingStatus}
          onChange={(e) => onFilingStatusChange(e.target.value as FilingStatus)}
        >
          {(Object.keys(FILING_STATUS_LABELS) as FilingStatus[]).map((fs) => (
            <option key={fs} value={fs}>
              {FILING_STATUS_LABELS[fs]}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="state">State</label>
        <select
          id="state"
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
        >
          <option value="">Select state</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="dependents">Number of Dependents</label>
        <input
          id="dependents"
          type="number"
          min={0}
          max={MAX_DEPENDENTS}
          step={1}
          value={dependents}
          onChange={handleDependentsChange}
        />
      </div>

      <p className="form-note">
        Results update automatically. Tax year: 2025 federal only.
        State income tax not included in v1.
      </p>
    </div>
  );
}
