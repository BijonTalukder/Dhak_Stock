export interface StockHistory {
  date: string;
  high: number;
  low: number;
  ltp: number;
  open: number;
  trade: number;
  value: number;
  volume: number;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  open: number;
  high: number;
  low: number;
  ycp: number;
  change: number;
  pct: number;
  vol: number;
  value: number;
  trade: number;
  dseIndex: number;
  spark: number[];
  history: StockHistory[];
  dataDate: string;
  lastUpdated: string;
}

export interface StockDetailsResponse {
  success: boolean;
  message: string;
  data: Stock;
}
