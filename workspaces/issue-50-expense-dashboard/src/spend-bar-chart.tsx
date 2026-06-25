import type { Expense } from './expenses';
import { categoryTotals } from './expenses';
import styles from './spend-bar-chart.module.css';

const CHART_W = 400;
const BAR_ZONE_H = 180;
const MAX_BAR_H = 150;
const SVG_H = BAR_ZONE_H + 70;
const BAR_W = 60;
const BAR_GAP = 20;
const CATEGORIES_ORDER = ['Bills', 'Food', 'Shopping', 'Transport'];
const LEFT_PAD =
  (CHART_W - (CATEGORIES_ORDER.length * BAR_W + (CATEGORIES_ORDER.length - 1) * BAR_GAP)) / 2;

interface Props {
  expenses: Expense[];
}

/** Inline SVG bar chart showing total spend per category. */
export default function SpendBarChart({ expenses }: Props) {
  const totals = categoryTotals(expenses);
  const values = Object.values(totals);
  const maxTotal = values.length > 0 ? Math.max(...values) : 1;

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox={`0 0 ${CHART_W} ${SVG_H}`}
        className={styles.chart}
        role="img"
        aria-label="Spend per category"
      >
        {CATEGORIES_ORDER.map((cat, i) => {
          const total = totals[cat] ?? 0;
          const barH = (total / maxTotal) * MAX_BAR_H;
          const x = LEFT_PAD + i * (BAR_W + BAR_GAP);
          const y = BAR_ZONE_H - barH;

          return (
            <g key={cat}>
              <rect
                x={x}
                y={y}
                width={BAR_W}
                height={barH}
                className={styles.bar}
                data-testid={`bar-${cat.toLowerCase()}`}
              />
              <text
                x={x + BAR_W / 2}
                y={BAR_ZONE_H + 20}
                textAnchor="middle"
                className={styles.catLabel}
              >
                {cat}
              </text>
              <text
                x={x + BAR_W / 2}
                y={y - 6}
                textAnchor="middle"
                className={styles.amountLabel}
              >
                ${total.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
