import styles from './depreciation-table.module.css';
import { DepreciationRow } from '../utils/depreciation';

interface Props {
  schedule: DepreciationRow[];
}

const CURRENCY_PREFIX = '$';

/** Formats a number as a dollar string with two decimal places. */
function formatCurrency(value: number): string {
  return `${CURRENCY_PREFIX}${value.toFixed(2)}`;
}

/** Renders the year-by-year depreciation schedule as a table. */
export default function DepreciationTable({ schedule }: Props) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col">Annual Depreciation</th>
            <th scope="col">Accumulated Depreciation</th>
            <th scope="col">Book Value</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map(row => (
            <tr key={row.year}>
              <td>{row.year}</td>
              <td>{formatCurrency(row.annualDepreciation)}</td>
              <td>{formatCurrency(row.accumulatedDepreciation)}</td>
              <td>{formatCurrency(row.bookValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
