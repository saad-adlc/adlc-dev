import type { Holding } from './types';

export function calcMarketValue(h: Holding): number {
  return h.shares * h.currentPrice;
}

export function calcCostBasis(h: Holding): number {
  return h.shares * h.avgCost;
}

export function calcGainLossDollar(h: Holding): number {
  return calcMarketValue(h) - calcCostBasis(h);
}

export function calcGainLossPct(h: Holding): number {
  const cb = calcCostBasis(h);
  return cb === 0 ? 0 : (calcGainLossDollar(h) / cb) * 100;
}

export function fmtMoney(n: number): string {
  return n.toFixed(2);
}

export function fmtSigned(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(2);
}

export function fmtSignedPct(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
}
