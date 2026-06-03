/** Input field names mapped to their numeric values. */
export interface LeaseBuyInputs {
  assetCost: number;
  downPayment: number;
  termMonths: number;
  monthlyLeasePayment: number;
  annualLoanRate: number;
  residualValue: number;
}

interface InputFormProps {
  values: LeaseBuyInputs;
  onChange: (field: keyof LeaseBuyInputs, value: number) => void;
}

interface FieldConfig {
  label: string;
  field: keyof LeaseBuyInputs;
  min: number;
  step: number;
  placeholder: string;
}

const FIELDS: FieldConfig[] = [
  { label: 'Asset Cost ($)', field: 'assetCost', min: 0, step: 1000, placeholder: '50000' },
  { label: 'Down Payment ($)', field: 'downPayment', min: 0, step: 500, placeholder: '5000' },
  { label: 'Lease Term (months)', field: 'termMonths', min: 1, step: 1, placeholder: '36' },
  { label: 'Monthly Lease Payment ($)', field: 'monthlyLeasePayment', min: 0, step: 10, placeholder: '800' },
  { label: 'Annual Loan Rate (%)', field: 'annualLoanRate', min: 0, step: 0.1, placeholder: '6.5' },
  { label: 'Residual / Salvage Value ($)', field: 'residualValue', min: 0, step: 500, placeholder: '15000' },
];

/**
 * Renders all numeric input fields for the lease vs buy calculator.
 */
export default function InputForm({ values, onChange }: InputFormProps) {
  return (
    <div className="input-form">
      {FIELDS.map(({ label, field, min, step, placeholder }) => (
        <div key={field} className="input-group">
          <label htmlFor={field}>{label}</label>
          <input
            id={field}
            type="number"
            min={min}
            step={step}
            placeholder={placeholder}
            value={values[field] === 0 ? '' : values[field]}
            onChange={(e) => onChange(field, parseFloat(e.target.value) || 0)}
          />
        </div>
      ))}
    </div>
  );
}
