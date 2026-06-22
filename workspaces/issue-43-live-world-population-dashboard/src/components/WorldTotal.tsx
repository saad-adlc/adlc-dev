import { formatNumber } from '../utils/population';

interface WorldTotalProps {
  total: number;
}

export default function WorldTotal({ total }: WorldTotalProps) {
  return (
    <section className="world-total" aria-label="World population">
      <div className="world-label">World Population</div>
      <div className="world-counter" data-testid="world-counter" aria-live="polite">
        {formatNumber(total)}
      </div>
      <div className="world-subtitle">+69 million / year · ≈0.84% annual growth</div>
    </section>
  );
}
