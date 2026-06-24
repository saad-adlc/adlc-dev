import { useState } from 'react';
import type { Holding } from '../types';

interface Props {
  onAdd: (h: Omit<Holding, 'id'>) => void;
}

export function AddHoldingForm({ onAdd }: Props) {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedShares = parseFloat(shares);
    const parsedAvgCost = parseFloat(avgCost);
    const parsedCurrentPrice = parseFloat(currentPrice);
    if (
      !ticker.trim() ||
      isNaN(parsedShares) ||
      isNaN(parsedAvgCost) ||
      isNaN(parsedCurrentPrice)
    ) {
      return;
    }
    onAdd({
      ticker: ticker.trim().toUpperCase(),
      shares: parsedShares,
      avgCost: parsedAvgCost,
      currentPrice: parsedCurrentPrice,
    });
    setTicker('');
    setShares('');
    setAvgCost('');
    setCurrentPrice('');
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Add holding">
      <input
        type="text"
        placeholder="Ticker"
        aria-label="Ticker"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
      />
      <input
        type="number"
        placeholder="Shares"
        aria-label="Shares"
        value={shares}
        step="any"
        min="0"
        onChange={(e) => setShares(e.target.value)}
      />
      <input
        type="number"
        placeholder="Avg Cost"
        aria-label="Avg Cost"
        value={avgCost}
        step="0.01"
        min="0"
        onChange={(e) => setAvgCost(e.target.value)}
      />
      <input
        type="number"
        placeholder="Current Price"
        aria-label="Current Price"
        value={currentPrice}
        step="0.01"
        min="0"
        onChange={(e) => setCurrentPrice(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}
