import { formatNumber } from '../utils/population';

interface ContinentCardProps {
  name: string;
  population: number;
  annualRatePct: number;
  sharePct: number;
}

export default function ContinentCard({ name, population, annualRatePct, sharePct }: ContinentCardProps) {
  const rateSign = annualRatePct >= 0 ? '+' : '';
  const rateLabel = `${rateSign}${annualRatePct.toFixed(2)}%`;

  const rateBadgeClass =
    annualRatePct < 0
      ? 'badge badge-danger'
      : name === 'Africa'
      ? 'badge badge-info'
      : 'badge badge-neutral';

  return (
    <div className="continent-card">
      <div className="continent-name">{name}</div>
      <div
        className="continent-counter"
        data-testid={`continent-counter-${name}`}
        aria-live="polite"
      >
        {formatNumber(population)}
      </div>
      <div className="badges">
        <span className="badge badge-neutral">{sharePct.toFixed(1)}% of world</span>
        <span className={rateBadgeClass}>{rateLabel}</span>
      </div>
    </div>
  );
}
