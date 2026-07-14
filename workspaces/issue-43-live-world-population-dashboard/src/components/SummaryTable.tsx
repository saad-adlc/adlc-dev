import { formatNumber } from '../utils/population';
import type { ContinentSnapshot } from '../utils/population';

interface SummaryTableProps {
  continents: ContinentSnapshot[];
}

/** Returns the CSS class for the growth-rate cell, matching the card badge logic. */
function rateCellClass(name: string, annualRatePct: number): string {
  if (annualRatePct < 0) return 'rate-cell rate-danger';
  if (name === 'Africa') return 'rate-cell rate-info';
  return 'rate-cell';
}

/** Live summary table showing one row per continent below the continent cards. */
export default function SummaryTable({ continents }: SummaryTableProps) {
  return (
    <section className="summary-table-section" aria-label="Continent summary">
      <table className="summary-table">
        <thead>
          <tr>
            <th scope="col">Continent</th>
            <th scope="col" className="col-numeric">Live Population</th>
            <th scope="col" className="col-numeric">Share of World</th>
            <th scope="col" className="col-numeric">Annual Growth Rate</th>
          </tr>
        </thead>
        <tbody>
          {continents.map((c, i) => {
            const rateSign = c.annualRatePct >= 0 ? '+' : '';
            const rateLabel = `${rateSign}${c.annualRatePct.toFixed(2)}%`;
            return (
              <tr key={c.name} className={i % 2 === 1 ? 'row-alt' : ''}>
                <td>{c.name}</td>
                <td
                  className="col-numeric tabular"
                  data-testid={`table-counter-${c.name}`}
                  aria-live="polite"
                >
                  {formatNumber(c.population)}
                </td>
                <td className="col-numeric">{c.sharePct.toFixed(1)}%</td>
                <td className={rateCellClass(c.name, c.annualRatePct)}>{rateLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
