export interface Lot {
  lotNumber: number;
  shares: number;
  purchasePrice: number;
  currentValue: number;
  unrealizedGainLoss: number;
  daysHeld: number;
}

export interface Stock {
  name: string;
  lots: Lot[];
  numBuys: number;
  numSells: number;
  avgGainPerSale: number;
}

export interface PortfolioData {
  totalPortfolioValue: number;
  totalProfit: number;
  totalLoss: number;
  numStocks: number;
  holdings: Stock[];
  isTrading: boolean;
}

