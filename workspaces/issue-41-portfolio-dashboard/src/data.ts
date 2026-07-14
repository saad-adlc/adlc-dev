import type { Holding } from './types';

export const INITIAL_HOLDINGS: Holding[] = [
  { id: '1', ticker: 'AAPL', shares: 10, avgCost: 150, currentPrice: 185 },
  { id: '2', ticker: 'MSFT', shares: 5,  avgCost: 300, currentPrice: 420 },
  { id: '3', ticker: 'GOOGL', shares: 8, avgCost: 120, currentPrice: 140 },
  { id: '4', ticker: 'AMZN', shares: 3,  avgCost: 140, currentPrice: 185 },
  { id: '5', ticker: 'TSLA', shares: 12, avgCost: 250, currentPrice: 205 },
];
