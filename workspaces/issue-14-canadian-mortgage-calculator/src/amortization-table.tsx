import { Fragment, useState } from 'react';
import type { YearSummary } from './mortgage-utils';
import { formatCAD } from './mortgage-utils';
import styles from './amortization-table.module.css';

interface Props {
  schedule: YearSummary[];
}

/** Expandable amortization schedule showing per-payment rows with yearly subtotals. */
export default function AmortizationTable({ schedule }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <button
        className={styles.toggle}
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
      >
        {isOpen ? 'Hide' : 'Show'} amortization schedule
      </button>

      {isOpen && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Payment #</th>
                <th scope="col">Interest</th>
                <th scope="col">Principal</th>
                <th scope="col">Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map(yearGroup => (
                <Fragment key={yearGroup.year}>
                  {yearGroup.rows.map(row => (
                    <tr key={row.paymentNumber}>
                      <td>{row.paymentNumber}</td>
                      <td>{formatCAD(row.interest)}</td>
                      <td>{formatCAD(row.principal)}</td>
                      <td>{formatCAD(row.balance)}</td>
                    </tr>
                  ))}
                  <tr className={styles.yearRow}>
                    <td>Year {yearGroup.year} total</td>
                    <td>{formatCAD(yearGroup.totalInterest)}</td>
                    <td>{formatCAD(yearGroup.totalPrincipal)}</td>
                    <td>{formatCAD(yearGroup.endingBalance)}</td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
