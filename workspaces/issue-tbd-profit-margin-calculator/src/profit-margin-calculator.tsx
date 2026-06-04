import { useState } from 'react';
import styles from './profit-margin-calculator.module.css';

/** RAG margin thresholds (%) */
const MARGIN_AMBER_MIN = 10;
const MARGIN_GREEN_MIN = 25;

type HealthStatus = 'red' | 'amber' | 'green';

interface MarginResult {
  grossMarginPct: number;
  netProfit: number;
  health: HealthStatus;
}

/**
 * Derives the RAG health status from a gross margin percentage.
 * red < 10%, amber 10–25%, green > 25%.
 */
function getHealthStatus(marginPct: number): HealthStatus {
  if (marginPct < MARGIN_AMBER_MIN) return 'red';
  if (marginPct < MARGIN_GREEN_MIN) return 'amber';
  return 'green';
}

/**
 * Computes gross margin % and net profit from revenue and total cost.
 * Returns null when inputs are invalid or revenue is zero.
 */
function computeMargin(revenue: number, cost: number): MarginResult | null {
  if (!isFinite(revenue) || !isFinite(cost) || revenue <= 0) return null;
  const netProfit = revenue - cost;
  const grossMarginPct = (netProfit / revenue) * 100;
  return {
    grossMarginPct,
    netProfit,
    health: getHealthStatus(grossMarginPct),
  };
}

/**
 * ProfitMarginCalculator — lightweight standalone component.
 * Accepts revenue + total cost and displays gross margin %, net profit,
 * and a RAG health bar.
 */
export default function ProfitMarginCalculator() {
  const [revenueInput, setRevenueInput] = useState('');
  const [costInput, setCostInput] = useState('');

  const revenue = parseFloat(revenueInput);
  const cost = parseFloat(costInput);
  const result = computeMargin(revenue, cost);

  const healthLabel: Record<HealthStatus, string> = {
    red: 'Low',
    amber: 'Moderate',
    green: 'Healthy',
  };

  return (
    <div className={styles.calculator}>
      <h1 className={styles.title}>Profit Margin Calculator</h1>

      <div className={styles.fields}>
        <label className={styles.label} htmlFor="revenue">
          Revenue
        </label>
        <input
          id="revenue"
          className={styles.input}
          type="number"
          min="0"
          placeholder="0"
          value={revenueInput}
          onChange={(e) => setRevenueInput(e.target.value)}
        />

        <label className={styles.label} htmlFor="total-cost">
          Total Cost
        </label>
        <input
          id="total-cost"
          className={styles.input}
          type="number"
          min="0"
          placeholder="0"
          value={costInput}
          onChange={(e) => setCostInput(e.target.value)}
        />
      </div>

      {result === null ? (
        <p className={styles.placeholder}>Enter values above to see results.</p>
      ) : (
        <div className={styles.results}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Gross Margin</span>
            <span className={styles.metricValue}>{result.grossMarginPct.toFixed(1)}%</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Net Profit</span>
            <span className={styles.metricValue}>{result.netProfit.toLocaleString()}</span>
          </div>

          <div className={styles.healthSection}>
            <div
              data-testid="health-bar"
              data-health={result.health}
              className={`${styles['health-bar']} ${styles[`health-bar--${result.health}`]}`}
            >
              <div
                className={styles['health-bar-fill']}
                style={{
                  width: `${Math.min(Math.max(result.grossMarginPct, 0), 100)}%`,
                }}
              />
            </div>
            <span className={styles[`health-label--${result.health}`]}>
              {healthLabel[result.health]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
