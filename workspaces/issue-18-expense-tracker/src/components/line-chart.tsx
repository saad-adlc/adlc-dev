import type { DailySpend } from '../chart-data';
import styles from '../app.module.css';

const WIDTH = 320;
const HEIGHT = 160;
const PADDING = { top: 10, right: 10, bottom: 30, left: 40 };

interface LineChartProps {
  data: DailySpend[];
}

/** SVG line chart showing daily spending over time. */
export default function LineChart({ data }: LineChartProps) {
  if (data.length === 0) {
    return <p className={styles.emptyState}>No data to display.</p>;
  }

  const innerW = WIDTH - PADDING.left - PADDING.right;
  const innerH = HEIGHT - PADDING.top - PADDING.bottom;

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const xStep = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const toX = (i: number) => PADDING.left + i * xStep;
  const toY = (val: number) => PADDING.top + innerH - (val / maxTotal) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.total)}`).join(' ');

  const labelStep = Math.max(1, Math.ceil(data.length / 5));

  return (
    <svg width="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth={2}
        points={points}
      />
      {data.map((d, i) => (
        <circle key={d.date} cx={toX(i)} cy={toY(d.total)} r={3} fill="#2563eb" />
      ))}
      {data.map((d, i) =>
        i % labelStep === 0 ? (
          <text
            key={`label-${d.date}`}
            x={toX(i)}
            y={HEIGHT - 4}
            fontSize={9}
            textAnchor="middle"
            fill="#6b7280"
          >
            {d.date.slice(5)}
          </text>
        ) : null,
      )}
      <line
        x1={PADDING.left}
        y1={PADDING.top}
        x2={PADDING.left}
        y2={PADDING.top + innerH}
        stroke="#e5e7eb"
      />
      <line
        x1={PADDING.left}
        y1={PADDING.top + innerH}
        x2={PADDING.left + innerW}
        y2={PADDING.top + innerH}
        stroke="#e5e7eb"
      />
    </svg>
  );
}
