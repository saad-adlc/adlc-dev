import styles from './depreciation-chart.module.css';
import { DepreciationRow } from '../utils/depreciation';

interface Props {
  schedule: DepreciationRow[];
  cost: number;
}

const CHART_HEIGHT = 180;
const BAR_WIDTH = 40;
const BAR_GAP = 20;
const LABEL_HEIGHT = 20;
const CHART_PADDING_X = 10;

/** SVG bar chart showing book value at the end of each depreciation year. */
export default function DepreciationChart({ schedule, cost }: Props) {
  const svgWidth =
    schedule.length * (BAR_WIDTH + BAR_GAP) - BAR_GAP + CHART_PADDING_X * 2;
  const svgHeight = CHART_HEIGHT + LABEL_HEIGHT;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Book Value Over Time</h2>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        role="img"
        aria-label="Bar chart of book value over time"
      >
        {schedule.map((row, i) => {
          const barHeight = cost > 0 ? (row.bookValue / cost) * CHART_HEIGHT : 0;
          const x = CHART_PADDING_X + i * (BAR_WIDTH + BAR_GAP);
          const y = CHART_HEIGHT - barHeight;

          return (
            <g key={row.year} role="group" aria-label={`Year ${row.year}`}>
              <rect
                className={styles.bar}
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={barHeight}
              />
              <text
                className={styles.label}
                x={x + BAR_WIDTH / 2}
                y={CHART_HEIGHT + LABEL_HEIGHT - 4}
                textAnchor="middle"
              >
                {row.year}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
