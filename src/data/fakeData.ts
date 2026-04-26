export interface Stock {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  pct: number;
  vol: number;
  mktCap: string;
  pe: number;
  high52: number;
  low52: number;
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
  { id: 1, symbol: 'GP', name: 'Grameenphone', sector: 'Telecom', price: 342.5, change: 2.35, pct: 0.69, vol: 1234567, mktCap: '92,450', pe: 18.5, high52: 390.0, low52: 298.0 },
  { id: 2, symbol: 'BRACBANK', name: 'BRAC Bank', sector: 'Banking', price: 42.3, change: -0.8, pct: -1.86, vol: 4567890, mktCap: '14,210', pe: 12.3, high52: 52.0, low52: 35.2 },
  { id: 3, symbol: 'DUTCHBANGL', name: 'Dutch-Bangla Bank', sector: 'Banking', price: 78.6, change: 1.2, pct: 1.55, vol: 2345678, mktCap: '25,100', pe: 15.2, high52: 88.0, low52: 61.0 },
  { id: 4, symbol: 'SQUAREPH', name: 'Square Pharma', sector: 'Pharma', price: 235.7, change: 3.5, pct: 1.51, vol: 876543, mktCap: '45,000', pe: 22.1, high52: 268.0, low52: 198.0 },
  { id: 5, symbol: 'RENATA', name: 'Renata Limited', sector: 'Pharma', price: 1285.0, change: -15.0, pct: -1.15, vol: 123456, mktCap: '38,100', pe: 28.4, high52: 1380.0, low52: 1090.0 },
  { id: 6, symbol: 'BEXIMCO', name: 'Beximco Ltd', sector: 'Textile', price: 28.4, change: 0.9, pct: 3.27, vol: 12345678, mktCap: '8,520', pe: 9.8, high52: 35.0, low52: 21.0 },
  { id: 7, symbol: 'WALTONHIL', name: 'Walton Hi-Tech', sector: 'Electronics', price: 865.5, change: 12.5, pct: 1.47, vol: 567890, mktCap: '120,400', pe: 25.3, high52: 942.0, low52: 720.0 },
  { id: 8, symbol: 'MARICO', name: 'Marico Bangladesh', sector: 'FMCG', price: 2145.0, change: 45.0, pct: 2.14, vol: 45678, mktCap: '52,100', pe: 32.6, high52: 2290.0, low52: 1840.0 },
  { id: 9, symbol: 'CITYBANK', name: 'The City Bank', sector: 'Banking', price: 26.8, change: -0.5, pct: -1.83, vol: 5678901, mktCap: '9,830', pe: 10.5, high52: 34.0, low52: 22.0 },
  { id: 10, symbol: 'MTB', name: 'Mutual Trust Bank', sector: 'Banking', price: 33.5, change: 1.1, pct: 3.4, vol: 3456789, mktCap: '6,240', pe: 11.2, high52: 40.0, low52: 27.0 },
  { id: 11, symbol: 'OLYMPIC', name: 'Olympic Industries', sector: 'Food', price: 198.4, change: 5.6, pct: 2.9, vol: 234567, mktCap: '18,100', pe: 20.4, high52: 225.0, low52: 155.0 },
  { id: 12, symbol: 'BSRM', name: 'BSRM Steels', sector: 'Steel', price: 89.2, change: -2.3, pct: -2.51, vol: 1234567, mktCap: '11,000', pe: 14.8, high52: 115.0, low52: 78.0 },
  { id: 13, symbol: 'LHBL', name: 'LafargeHolcim BD', sector: 'Cement', price: 64.7, change: 1.8, pct: 2.86, vol: 2345678, mktCap: '16,000', pe: 18.9, high52: 78.0, low52: 51.0 },
  { id: 14, symbol: 'TITASGAS', name: 'Titas Gas T&D', sector: 'Energy', price: 38.9, change: -0.6, pct: -1.52, vol: 4567890, mktCap: '7,820', pe: 8.9, high52: 46.0, low52: 31.0 },
  { id: 15, symbol: 'SINGERBD', name: 'Singer Bangladesh', sector: 'Electronics', price: 185.3, change: -3.2, pct: -1.7, vol: 345678, mktCap: '12,100', pe: 16.7, high52: 218.0, low52: 158.0 },
  { id: 16, symbol: 'PADMALIFE', name: 'Padma Life Ins.', sector: 'Insurance', price: 44.6, change: 2.1, pct: 4.94, vol: 1987654, mktCap: '3,400', pe: 14.2, high52: 55.0, low52: 33.0 },
  { id: 17, symbol: 'SUMMITPOW', name: 'Summit Power', sector: 'Energy', price: 38.2, change: -0.9, pct: -2.30, vol: 3210987, mktCap: '9,100', pe: 11.0, high52: 48.0, low52: 29.0 },
  { id: 18, symbol: 'ISLAMIBANK', name: 'Islami Bank BD', sector: 'Banking', price: 31.5, change: 0.4, pct: 1.28, vol: 6789012, mktCap: '12,600', pe: 9.5, high52: 38.0, low52: 25.0 },
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
