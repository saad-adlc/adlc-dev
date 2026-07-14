import type { CategorySlice } from '../chart-data';
import styles from '../app.module.css';

const CHART_COLORS = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed',
  '#0891b2', '#be185d', '#65a30d', '#ea580c', '#6366f1',
];

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = 180;
const CENTER = SIZE / 2;

interface DonutChartProps {
  slices: CategorySlice[];
}

/** SVG donut chart showing spending share per category. */
export default function DonutChart({ slices }: DonutChartProps) {
  if (slices.length === 0) {
    return <p className={styles.emptyState}>No data to display.</p>;
  }

  let cumulativePercent = 0;

  return (
    <div>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {slices.map((slice, i) => {
          const dashArray = (slice.percentage / 100) * CIRCUMFERENCE;
          const dashOffset = CIRCUMFERENCE - cumulativePercent * CIRCUMFERENCE / 100;
          cumulativePercent += slice.percentage;
          return (
            <circle
              key={slice.category}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={30}
              strokeDasharray={`${dashArray} ${CIRCUMFERENCE - dashArray}`}
              strokeDashoffset={dashOffset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${CENTER}px ${CENTER}px` }}
            />
          );
        })}
      </svg>
      <div className={styles.legend}>
        {slices.map((slice, i) => (
          <div key={slice.category} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span>{slice.category} — {slice.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
