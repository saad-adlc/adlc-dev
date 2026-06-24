import type { Holding, SortDir, SortKey } from '../types';
import {
  calcMarketValue,
  calcCostBasis,
  calcGainLossDollar,
  calcGainLossPct,
  fmtMoney,
  fmtSigned,
  fmtSignedPct,
} from '../utils';

interface Props {
  holdings: Holding[];
  sortKey: SortKey | null;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  onRemove: (id: string) => void;
  onPriceChange: (id: string, price: number) => void;
}

export function PortfolioTable({ holdings, sortKey, sortDir, onSort, onRemove, onPriceChange }: Props) {
  const totalMV = holdings.reduce((s, h) => s + calcMarketValue(h), 0);
  const totalCB = holdings.reduce((s, h) => s + calcCostBasis(h), 0);
  const totalGL = totalMV - totalCB;
  const totalGLPct = totalCB === 0 ? 0 : (totalGL / totalCB) * 100;

  function sortIndicator(key: SortKey): string {
    if (sortKey !== key) return '↕';
    return sortDir === 'desc' ? '↓' : '↑';
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Ticker</th>
          <th>Shares</th>
          <th>Avg Cost</th>
          <th>Current Price</th>
          <th>
            <button type="button" onClick={() => onSort('marketValue')}>
              Market Value {sortIndicator('marketValue')}
            </button>
          </th>
          <th>Cost Basis</th>
          <th>Gain/Loss $</th>
          <th>
            <button type="button" onClick={() => onSort('gainLossPct')}>
              Gain/Loss % {sortIndicator('gainLossPct')}
            </button>
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {holdings.map((h) => {
          const mv = calcMarketValue(h);
          const cb = calcCostBasis(h);
          const gl = calcGainLossDollar(h);
          const glPct = calcGainLossPct(h);
          return (
            <tr key={h.id}>
              <td>{h.ticker}</td>
              <td>{h.shares}</td>
              <td>{fmtMoney(h.avgCost)}</td>
              <td>
                <input
                  type="number"
                  aria-label={`${h.ticker} current price`}
                  value={h.currentPrice}
                  step="0.01"
                  min="0"
                  onChange={(e) => onPriceChange(h.id, parseFloat(e.target.value) || 0)}
                />
              </td>
              <td>{fmtMoney(mv)}</td>
              <td>{fmtMoney(cb)}</td>
              <td>{fmtSigned(gl)}</td>
              <td>{fmtSignedPct(glPct)}</td>
              <td>
                <button type="button" aria-label={`Remove ${h.ticker}`} onClick={() => onRemove(h.id)}>
                  Remove
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr data-testid="totals-row">
          <td colSpan={4}>Total</td>
          <td>{fmtMoney(totalMV)}</td>
          <td>{fmtMoney(totalCB)}</td>
          <td>{fmtSigned(totalGL)}</td>
          <td>{fmtSignedPct(totalGLPct)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  );
}
