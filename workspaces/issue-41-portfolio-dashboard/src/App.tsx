import { useState, useRef } from 'react';
import type { Holding, SortDir, SortKey } from './types';
import { INITIAL_HOLDINGS } from './data';
import { calcMarketValue, calcGainLossPct } from './utils';
import { PortfolioTable } from './components/PortfolioTable';
import { AllocationChart } from './components/AllocationChart';
import { AddHoldingForm } from './components/AddHoldingForm';

export default function App() {
  const [holdings, setHoldings] = useState<Holding[]>(INITIAL_HOLDINGS);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const nextId = useRef(100);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function handleAdd(data: Omit<Holding, 'id'>) {
    const id = String(nextId.current++);
    setHoldings((prev) => [...prev, { id, ...data }]);
  }

  function handleRemove(id: string) {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }

  function handlePriceChange(id: string, price: number) {
    setHoldings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, currentPrice: price } : h)),
    );
  }

  const sortedHoldings =
    sortKey === null
      ? holdings
      : [...holdings].sort((a, b) => {
          const valA = sortKey === 'marketValue' ? calcMarketValue(a) : calcGainLossPct(a);
          const valB = sortKey === 'marketValue' ? calcMarketValue(b) : calcGainLossPct(b);
          return sortDir === 'desc' ? valB - valA : valA - valB;
        });

  return (
    <div id="app">
      <h1>Portfolio Dashboard</h1>
      <AddHoldingForm onAdd={handleAdd} />
      <PortfolioTable
        holdings={sortedHoldings}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onRemove={handleRemove}
        onPriceChange={handlePriceChange}
      />
      <AllocationChart holdings={holdings} />
    </div>
  );
}
