export interface Holding {
  id: string;
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
}

export type SortKey = 'marketValue' | 'gainLossPct';
export type SortDir = 'desc' | 'asc';
