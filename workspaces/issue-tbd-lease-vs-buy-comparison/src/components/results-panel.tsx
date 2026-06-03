import { formatCurrency } from '../utils/format-currency';

interface ResultsPanelProps {
  monthlyLoanPayment: number;
  totalLeaseCost: number;
  totalBuyCost: number;
  isValid: boolean;
}

/** Labels for each result row. */
const RESULT_ROWS = [
  { label: 'Monthly Loan Payment', leaseKey: null as null, buyKey: 'monthlyLoanPayment' as const },
];

type Winner = 'lease' | 'buy' | 'tie';

/** Determines the cheaper option. */
function getWinner(leaseCost: number, buyCost: number): Winner {
  if (leaseCost < buyCost) return 'lease';
  if (buyCost < leaseCost) return 'buy';
  return 'tie';
}

const WINNER_LABEL: Record<Winner, string> = {
  lease: '🏆 Leasing is cheaper',
  buy: '🏆 Buying is cheaper',
  tie: '🤝 Both options cost the same',
};

/**
 * Displays the side-by-side cost comparison results panel.
 */
export default function ResultsPanel({
  monthlyLoanPayment,
  totalLeaseCost,
  totalBuyCost,
  isValid,
}: ResultsPanelProps) {
  if (!isValid) {
    return (
      <div className="results-panel results-panel--empty">
        <p>Enter all values above to see the comparison.</p>
      </div>
    );
  }

  const winner = getWinner(totalLeaseCost, totalBuyCost);

  return (
    <div className="results-panel">
      <table className="results-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Lease</th>
            <th>Buy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monthly Payment</td>
            <td>{formatCurrency(monthlyLoanPayment > 0 ? 0 : 0)}—</td>
            <td>{formatCurrency(monthlyLoanPayment)}</td>
          </tr>
          <tr className="results-table__total-row">
            <td>Total Cost (over term)</td>
            <td className={winner === 'lease' ? 'results-table__winner' : ''}>
              {formatCurrency(totalLeaseCost)}
            </td>
            <td className={winner === 'buy' ? 'results-table__winner' : ''}>
              {formatCurrency(totalBuyCost)}
            </td>
          </tr>
          <tr>
            <td>Net Savings vs Other Option</td>
            <td className={winner === 'lease' ? 'results-table__winner' : ''}>
              {winner === 'lease'
                ? `${formatCurrency(totalBuyCost - totalLeaseCost)} saved`
                : winner === 'buy'
                ? `${formatCurrency(totalLeaseCost - totalBuyCost)} more`
                : '—'}
            </td>
            <td className={winner === 'buy' ? 'results-table__winner' : ''}>
              {winner === 'buy'
                ? `${formatCurrency(totalLeaseCost - totalBuyCost)} saved`
                : winner === 'lease'
                ? `${formatCurrency(totalBuyCost - totalLeaseCost)} more`
                : '—'}
            </td>
          </tr>
        </tbody>
      </table>
      <div className={`results-panel__verdict results-panel__verdict--${winner}`}>
        {WINNER_LABEL[winner]}
      </div>
    </div>
  );
}

// Re-export for testing
export { getWinner };
export type { Winner };

// Suppress unused import warning — RESULT_ROWS is reserved for future expansion
void RESULT_ROWS;
