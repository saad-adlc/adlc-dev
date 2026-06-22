import type { Holding } from '../types';
import { calcMarketValue } from '../utils';

const COLORS = ['#4f86c6', '#f47e5f', '#6cc77b', '#f5c242', '#a66bcf', '#e07070', '#70aee0', '#70e0a0'];

const LABEL_W = 60;
const BAR_MAX_W = 280;
const PCT_W = 52;
const ROW_H = 26;
const SVG_W = LABEL_W + BAR_MAX_W + PCT_W + 8;

interface Props {
  holdings: Holding[];
}

export function AllocationChart({ holdings }: Props) {
  const total = holdings.reduce((sum, h) => sum + calcMarketValue(h), 0);
  const svgH = Math.max(holdings.length * ROW_H, 1);

  return (
    <svg
      width={SVG_W}
      height={svgH}
      role="img"
      aria-label="Portfolio allocation chart"
    >
      {holdings.map((h, i) => {
        const mv = calcMarketValue(h);
        const pct = total > 0 ? (mv / total) * 100 : 0;
        const barW = total > 0 ? (mv / total) * BAR_MAX_W : 0;
        const y = i * ROW_H;
        return (
          <g key={h.id}>
            <text x={LABEL_W - 4} y={y + 17} textAnchor="end" fontSize="13">
              {h.ticker}
            </text>
            <rect
              x={LABEL_W}
              y={y + 4}
              width={barW}
              height={ROW_H - 8}
              fill={COLORS[i % COLORS.length]}
              rx="3"
            />
            <text x={LABEL_W + barW + 4} y={y + 17} fontSize="12">
              {pct.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
