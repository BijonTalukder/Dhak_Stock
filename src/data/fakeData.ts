export interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  pct: number;
  vol: number;
  high: number;
  low: number;
  open: number;
  close: number;
  ycp: number;
  trade: number;
  value: number;
  dseIndex: number;
  spark: number[];
  dayChart: number[];
}

export interface NewsItem {
  id: number;
  title: string;
  time: string;
  tag: string;
  cat: 'market' | 'company' | 'regulatory' | 'economy';
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  profit: number;
  pct: number;
  trades: number;
  isMe?: boolean;
}

export interface LearnModule {
  id: number;
  title: string;
  icon: string;
  lessons: number;
  done: number;
  color: string;
  desc: string;
}

export interface Holding {
  symbol: string;
  qty: number;
  avgPrice: number;
}

export const DSEX = { value: 6842.35, change: 23.47, pct: 0.34, high: 6891.20, low: 6812.10, vol: '12,450Cr', trades: '184,320' };
export const DSES = { value: 1403.28, change: -4.11, pct: -0.29 };

export function genSpark(endPrice: number, pct: number, n: number = 24): number[] {
  const start = endPrice / (1 + pct / 100);
  let p = start;
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    p += (Math.random() - 0.47) * (endPrice * 0.006);
    p = Math.max(endPrice * 0.75, Math.min(endPrice * 1.25, p));
    arr.push(p);
  }
  arr[arr.length - 1] = endPrice;
  return arr;
}

export function genDayChart(base: number, n: number = 78): number[] {
  let p = base * 0.985;
  return Array.from({ length: n }, (_, i) => {
    p += (Math.random() - 0.47) * (base * 0.004);
    p = Math.max(base * 0.92, p);
    return parseFloat(p.toFixed(2));
  });
}

export const RAW_STOCKS = [
  { id: '1', symbol: 'GP', name: 'Grameenphone', sector: 'Telecom', price: 342.5, change: 2.35, pct: 0.69, vol: 1234567, high: 390.0, low: 298.0, open: 340.0, close: 342.5, ycp: 340.15, trade: 1200, value: 42.0, dseIndex: 1 },
  { id: '2', symbol: 'BRACBANK', name: 'BRAC Bank', sector: 'Banking', price: 42.3, change: -0.8, pct: -1.86, vol: 4567890, high: 52.0, low: 35.2, open: 43.0, close: 42.3, ycp: 43.1, trade: 3500, value: 19.3, dseIndex: 2 },
  { id: '3', symbol: 'DUTCHBANGL', name: 'Dutch-Bangla Bank', sector: 'Banking', price: 78.6, change: 1.2, pct: 1.55, vol: 2345678, high: 88.0, low: 61.0, open: 77.5, close: 78.6, ycp: 77.4, trade: 2100, value: 18.4, dseIndex: 3 },
  { id: '4', symbol: 'SQUAREPH', name: 'Square Pharma', sector: 'Pharma', price: 235.7, change: 3.5, pct: 1.51, vol: 876543, high: 268.0, low: 198.0, open: 232.0, close: 235.7, ycp: 232.2, trade: 950, value: 20.6, dseIndex: 4 },
  { id: '5', symbol: 'RENATA', name: 'Renata Limited', sector: 'Pharma', price: 1285.0, change: -15.0, pct: -1.15, vol: 123456, high: 1380.0, low: 1090.0, open: 1300.0, close: 1285.0, ycp: 1300.0, trade: 200, value: 15.9, dseIndex: 5 },
  { id: '6', symbol: 'BEXIMCO', name: 'Beximco Ltd', sector: 'Textile', price: 28.4, change: 0.9, pct: 3.27, vol: 12345678, high: 35.0, low: 21.0, open: 27.5, close: 28.4, ycp: 27.5, trade: 8000, value: 35.1, dseIndex: 6 },
  { id: '7', symbol: 'WALTONHIL', name: 'Walton Hi-Tech', sector: 'Electronics', price: 865.5, change: 12.5, pct: 1.47, vol: 567890, high: 942.0, low: 720.0, open: 853.0, close: 865.5, ycp: 853.0, trade: 600, value: 49.1, dseIndex: 7 },
  { id: '8', symbol: 'MARICO', name: 'Marico Bangladesh', sector: 'FMCG', price: 2145.0, change: 45.0, pct: 2.14, vol: 45678, high: 2290.0, low: 1840.0, open: 2100.0, close: 2145.0, ycp: 2100.0, trade: 50, value: 9.8, dseIndex: 8 },
  { id: '9', symbol: 'CITYBANK', name: 'The City Bank', sector: 'Banking', price: 26.8, change: -0.5, pct: -1.83, vol: 5678901, high: 34.0, low: 22.0, open: 27.3, close: 26.8, ycp: 27.3, trade: 4200, value: 15.2, dseIndex: 9 },
  { id: '10', symbol: 'MTB', name: 'Mutual Trust Bank', sector: 'Banking', price: 33.5, change: 1.1, pct: 3.4, vol: 3456789, high: 40.0, low: 27.0, open: 32.4, close: 33.5, ycp: 32.4, trade: 2800, value: 11.6, dseIndex: 10 },
  { id: '11', symbol: 'OLYMPIC', name: 'Olympic Industries', sector: 'Food', price: 198.4, change: 5.6, pct: 2.9, vol: 234567, high: 225.0, low: 155.0, open: 193.0, close: 198.4, ycp: 192.8, trade: 300, value: 4.7, dseIndex: 11 },
  { id: '12', symbol: 'BSRM', name: 'BSRM Steels', sector: 'Steel', price: 89.2, change: -2.3, pct: -2.51, vol: 1234567, high: 115.0, low: 78.0, open: 91.5, close: 89.2, ycp: 91.5, trade: 1500, value: 11.0, dseIndex: 12 },
  { id: '13', symbol: 'LHBL', name: 'LafargeHolcim BD', sector: 'Cement', price: 64.7, change: 1.8, pct: 2.86, vol: 2345678, high: 78.0, low: 51.0, open: 62.9, close: 64.7, ycp: 62.9, trade: 2000, value: 15.2, dseIndex: 13 },
  { id: '14', symbol: 'TITASGAS', name: 'Titas Gas T&D', sector: 'Energy', price: 38.9, change: -0.6, pct: -1.52, vol: 4567890, high: 46.0, low: 31.0, open: 39.5, close: 38.9, ycp: 39.5, trade: 3500, value: 17.8, dseIndex: 14 },
  { id: '15', symbol: 'SINGERBD', name: 'Singer Bangladesh', sector: 'Electronics', price: 185.3, change: -3.2, pct: -1.7, vol: 345678, high: 218.0, low: 158.0, open: 188.5, close: 185.3, ycp: 188.5, trade: 400, value: 6.4, dseIndex: 15 },
  { id: '16', symbol: 'PADMALIFE', name: 'Padma Life Ins.', sector: 'Insurance', price: 44.6, change: 2.1, pct: 4.94, vol: 1987654, high: 55.0, low: 33.0, open: 42.5, close: 44.6, ycp: 42.5, trade: 1800, value: 8.9, dseIndex: 16 },
  { id: '17', symbol: 'SUMMITPOW', name: 'Summit Power', sector: 'Energy', price: 38.2, change: -0.9, pct: -2.30, vol: 3210987, high: 48.0, low: 29.0, open: 39.1, close: 38.2, ycp: 39.1, trade: 2500, value: 12.3, dseIndex: 17 },
  { id: '18', symbol: 'ISLAMIBANK', name: 'Islami Bank BD', sector: 'Banking', price: 31.5, change: 0.4, pct: 1.28, vol: 6789012, high: 38.0, low: 25.0, open: 31.1, close: 31.5, ycp: 31.1, trade: 5000, value: 21.4, dseIndex: 18 },
];

export const STOCKS: Stock[] = RAW_STOCKS.map(s => ({ ...s, spark: genSpark(s.price, s.pct), dayChart: genDayChart(s.price) }));

export const NEWS: NewsItem[] = [
  { id: 1, title: 'DSE turnover crosses ৳1,200 crore for third consecutive session', time: '2h ago', tag: 'Market', cat: 'market' },
  { id: 2, title: 'Grameenphone Q1 profit rises 14% to ৳858 crore on data revenue surge', time: '3h ago', tag: 'GP', cat: 'company' },
  { id: 3, title: 'BSEC approves new IPO guidelines for SME board listing', time: '5h ago', tag: 'Regulatory', cat: 'regulatory' },
  { id: 4, title: 'Walton reports record quarterly revenue as electronics demand peaks', time: '6h ago', tag: 'WALTON', cat: 'company' },
  { id: 5, title: 'Bangladesh Bank holds policy rate steady at 8.50% amid inflation', time: '8h ago', tag: 'Economy', cat: 'economy' },
  { id: 6, title: 'Square Pharma secures WHO prequalification for three new generics', time: '10h ago', tag: 'SQUAREPH', cat: 'company' },
  { id: 7, title: 'DSEX gains 0.34% as banking and pharma sectors lead rally', time: '12h ago', tag: 'Market', cat: 'market' },
  { id: 8, title: 'Foreign investors net buyers for 5th straight week, buy ৳180Cr', time: '1d ago', tag: 'FII', cat: 'market' },
];

export const LEADERBOARD_DATA: LeaderboardUser[] = [
  { rank: 1, name: 'Rahim Hossain', avatar: 'RH', profit: 42850, pct: 42.85, trades: 128 },
  { rank: 2, name: 'Fatema Begum', avatar: 'FB', profit: 38210, pct: 38.21, trades: 95 },
  { rank: 3, name: 'Karim Uddin', avatar: 'KU', profit: 31400, pct: 31.40, trades: 154 },
  { rank: 4, name: 'Nasrin Ahmed', avatar: 'NA', profit: 28750, pct: 28.75, trades: 87 },
  { rank: 5, name: 'Jakir Hassan', avatar: 'JH', profit: 24300, pct: 24.30, trades: 112 },
  { rank: 6, name: 'Sumaiya Khan', avatar: 'SK', profit: 19800, pct: 19.80, trades: 73 },
  { rank: 7, name: 'Arif Rahman', avatar: 'AR', profit: 16500, pct: 16.50, trades: 98 },
  { rank: 8, name: 'You', avatar: 'ME', profit: 0, pct: 0, trades: 0, isMe: true },
];

export const LEARN_MODULES: LearnModule[] = [
  { id: 1, title: 'Stock Market Basics', icon: '📘', lessons: 8, done: 0, color: '#6398FF', desc: 'What is DSE? How stocks work. How to read price tables.' },
  { id: 2, title: 'Reading Charts', icon: '📊', lessons: 6, done: 0, color: '#00D09C', desc: 'Candlestick patterns, support/resistance, trend lines.' },
  { id: 3, title: 'Technical Indicators', icon: '📉', lessons: 7, done: 0, color: '#F59E0B', desc: 'MA, RSI, MACD, Bollinger Bands explained simply.' },
  { id: 4, title: 'Risk Management', icon: '🛡️', lessons: 5, done: 0, color: '#FF4466', desc: 'Stop loss, position sizing, portfolio diversification.' },
  { id: 5, title: 'Fundamental Analysis', icon: '🔍', lessons: 9, done: 0, color: '#A78BFA', desc: 'P/E ratio, EPS, dividend yield and reading financials.' },
  { id: 6, title: 'Trading Strategies', icon: '⚡', lessons: 10, done: 0, color: '#34D399', desc: 'Swing trading, scalping, value investing strategies.' },
];

export const fmt = (n: number, dec: number = 2): string => n.toLocaleString('en-BD', { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const fmtVol = (n: number): string => n >= 1e7 ? `${(n/1e7).toFixed(2)}Cr` : n >= 1e5 ? `${(n/1e5).toFixed(1)}L` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : String(n);
