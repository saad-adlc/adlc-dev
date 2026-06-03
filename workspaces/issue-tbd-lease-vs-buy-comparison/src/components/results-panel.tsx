import { formatCurrency } from '../utils/format-currency';

interface ResultsPanelProps {
  monthlyLeasePayment: number;
  monthlyLoanPayment: number;
  totalLeaseCost: number;
  totalBuyCost: number;
  isValid: boolean;
}

type Winner = 'lease' | 'buy' | 'tie';

/** Determines the cheaper option based on total cost. */
export function getWinner(leaseCost: number, buyCost: number): Winner {
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
  monthlyLeasePayment,
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
  const leaseSavings = totalBuyCost - totalLeaseCost;
  const buySavings = totalLeaseCost - totalBuyCost;

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
            <td>{formatCurrency(monthlyLeasePayment)}</td>
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
              {winner === 'lease' && formatCurrency(leaseSavings) + ' saved'}
              {winner === 'buy' && formatCurrency(buySavings) + ' more'}
              {winner === 'tie' && '—'}
            </td>
            <td className={winner === 'buy' ? 'results-table__winner' : ''}>
              {winner === 'buy' && formatCurrency(buySavings) + ' saved'}
              {winner === 'lease' && formatCurrency(leaseSavings) + ' more'}
              {winner === 'tie' && '—'}
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

export type { Winner };
