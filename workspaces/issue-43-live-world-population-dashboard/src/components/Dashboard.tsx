import { useState, useEffect } from 'react';
import {
  computeContinentPopulations,
  computeWorldTotal,
  getElapsedSeconds,
} from '../utils/population';
import WorldTotal from './WorldTotal';
import ContinentCard from './ContinentCard';
import SummaryTable from './SummaryTable';

export default function Dashboard() {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const continents = computeContinentPopulations(getElapsedSeconds(nowMs));
  const worldTotal = computeWorldTotal(continents);

  return (
    <main className="dashboard">
      <WorldTotal total={worldTotal} />
      <div className="continent-grid">
        {continents.map(c => (
          <ContinentCard
            key={c.name}
            name={c.name}
            population={c.population}
            annualRatePct={c.annualRatePct}
            sharePct={c.sharePct}
          />
        ))}
      </div>
      <SummaryTable continents={continents} />
      <footer className="source-footnote">
        Data: UN World Population Prospects 2024 / Worldometer. Figures are statistical estimates.
      </footer>
    </main>
  );
}
