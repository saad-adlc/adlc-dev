import styles from './balance-visual.module.css';

const SVG_WIDTH = 540;
const BAR_HEIGHT = 28;
const BAR_OFFSET_X = 120;
const MAX_BAR_WIDTH = 300;

interface BalanceVisualProps {
  assetTotal: number;
  claimsTotal: number;
}

/** Computes proportional bar width; caller guarantees maxValue > 0. */
function computeBarWidth(value: number, maxValue: number): number {
  return (Math.max(value, 0) / maxValue) * MAX_BAR_WIDTH;
}

/** Compact dollar label without cents for use inside the SVG. */
function barLabel(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/** Inline SVG two-bar chart comparing Assets to Liabilities+Equity. */
export default function BalanceVisual({ assetTotal, claimsTotal }: BalanceVisualProps) {
  const maxValue = Math.max(Math.abs(assetTotal), Math.abs(claimsTotal), 1);
  const assetWidth = computeBarWidth(assetTotal, maxValue);
  const claimsWidth = computeBarWidth(claimsTotal, maxValue);
  const row2Y = BAR_HEIGHT + 20;

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Balance Visual</h3>
      <svg
        width={SVG_WIDTH}
        height={row2Y + BAR_HEIGHT + 10}
        role="img"
        aria-label="Balance chart comparing assets to liabilities and equity"
      >
        <text x={BAR_OFFSET_X - 6} y={BAR_HEIGHT - 4} textAnchor="end" fontSize="13">
          Assets
        </text>
        <rect x={BAR_OFFSET_X} y={0} width={assetWidth} height={BAR_HEIGHT} className={styles.assetBar} />
        <text x={BAR_OFFSET_X + assetWidth + 6} y={BAR_HEIGHT - 4} fontSize="12">
          {barLabel(assetTotal)}
        </text>

        <text x={BAR_OFFSET_X - 6} y={row2Y + BAR_HEIGHT - 4} textAnchor="end" fontSize="13">
          Liab + Equity
        </text>
        <rect
          x={BAR_OFFSET_X}
          y={row2Y}
          width={claimsWidth}
          height={BAR_HEIGHT}
          className={styles.claimsBar}
        />
        <text x={BAR_OFFSET_X + claimsWidth + 6} y={row2Y + BAR_HEIGHT - 4} fontSize="12">
          {barLabel(claimsTotal)}
        </text>
      </svg>
    </div>
  );
}
