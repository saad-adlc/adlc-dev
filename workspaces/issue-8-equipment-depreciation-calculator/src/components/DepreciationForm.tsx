import styles from './depreciation-form.module.css';
import { DepreciationInputs, DepreciationMethod } from '../utils/depreciation';

interface Props {
  inputs: DepreciationInputs;
  onChange: (inputs: DepreciationInputs) => void;
  error: string | null;
}

/** Controlled input form for depreciation parameters. */
export default function DepreciationForm({ inputs, onChange, error }: Props) {
  function handleCost(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...inputs, cost: parseFloat(e.target.value) });
  }

  function handleSalvage(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    onChange({ ...inputs, salvage: raw === '' ? 0 : parseFloat(raw) });
  }

  function handleLife(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...inputs, life: parseInt(e.target.value, 10) });
  }

  function handleMethod(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange({ ...inputs, method: e.target.value as DepreciationMethod });
  }

  return (
    <form className={styles.form} aria-label="Depreciation inputs">
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <div className={styles.field}>
        <label htmlFor="cost">Asset Cost ($)</label>
        <input
          id="cost"
          type="number"
          min="0"
          step="0.01"
          value={isNaN(inputs.cost) ? '' : inputs.cost}
          onChange={handleCost}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="salvage">Salvage Value ($)</label>
        <input
          id="salvage"
          type="number"
          min="0"
          step="0.01"
          value={inputs.salvage}
          onChange={handleSalvage}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="life">Useful Life (years)</label>
        <input
          id="life"
          type="number"
          min="1"
          step="1"
          value={isNaN(inputs.life) ? '' : inputs.life}
          onChange={handleLife}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="method">Depreciation Method</label>
        <select id="method" value={inputs.method} onChange={handleMethod}>
          <option value="straight-line">Straight-Line</option>
          <option value="declining-balance">200% Declining Balance</option>
        </select>
      </div>
    </form>
  );
}
