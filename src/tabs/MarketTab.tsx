import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useGetMarketDataQuery } from '../api/services/market/marketApi';
import { Badge, StockRow } from '../components/SharedComponents';
import { SparkLine } from '../components/SparkLine';
import { fmt, NEWS } from '../data/fakeData';
import { colors, globalStyles } from '../theme';

// ── Types ──────────────────────────────────────────────────────────────────────
interface StockPrices {
  open: number;
  ltp: number;
  high: number;
  low: number;
  close: number;
  ycp: number;
  change: number;
  changePercent: number;
  trade: number;
  value: number;
  volume: number;
  dseIndex: number;
}

interface StockItemMarket {
  stockCode: string;
  stockName: string;
  sector: string;
  date: string;
  prices: StockPrices;
}

// RTK Query এর data field = server-এর full response body
interface ApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: StockItemMarket[];
}

// ── Data Sanitization ─────────────────────────────────────────────────────────

// real data-তে কিছু স্টক suspended/halted (ltp=0, volume=0)
// EASTRNLUB, RECKITTBEN, BERGERPBL — এদের changePercent -2330, -3113 এরকম garbage আসছে
// এগুলো filter + clamp করতে হবে
const isValidStock = (item: StockItemMarket): boolean => {
  const p = item.prices;
  return (
    p.ltp > 0 &&                          // traded today
    p.volume > 0 &&                        // has volume
    Math.abs(p.changePercent) < 100        // clamp outlier % (EASTRNLUB -2330 etc)
  );
};

// ── Spark Generator (fallback — real intraday data নেই) ────────────────────────
function genSpark(endPrice: number, pct: number, n = 24): number[] {
  if (!endPrice || endPrice <= 0) return Array(n).fill(0);
  // clamp pct যাতে NaN না আসে
  const safePct = Math.max(-50, Math.min(50, pct));
  let p = endPrice / (1 + safePct / 100);
  return Array.from({ length: n }, (_, i) => {
    p += (Math.random() - 0.47) * (endPrice * 0.006);
    p = Math.max(endPrice * 0.75, Math.min(endPrice * 1.25, p));
    return i === n - 1 ? endPrice : parseFloat(p.toFixed(2));
  });
}

// ── API item → internal Stock shape ──────────────────────────────────────────
function toStock(item: StockItemMarket) {
  const p = item.prices;
  // displayPrice: ltp থাকলে ltp, না হলে close (suspended stocks)
  const displayPrice = p.ltp > 0 ? p.ltp : p.close;

  return {
    id: item.stockCode,
    symbol: item.stockCode,
    name: item.stockName,
    sector: item.sector === 'Unknown' ? inferSector(item.stockCode) : item.sector,
    price: displayPrice,
    change: p.change,
    pct: p.changePercent,
    vol: p.volume,
    high: p.high,
    low: p.low,
    open: p.open,
    close: p.close,
    ycp: p.ycp,            // yesterday's closing price
    trade: p.trade,          // number of trades
    value: p.value,          // turnover in crore
    dseIndex: p.dseIndex,       // rank by volume on DSE
    spark: genSpark(displayPrice, p.changePercent),
    dayChart: [] as number[],
  };
}

export type MappedStock = ReturnType<typeof toStock>;

function inferSector(code: string): string {
  const c = code.toUpperCase();
  if (/BANK|IFIC|UCB|MTB|EBL|DBH/.test(c)) return 'Banking';
  if (/INS|LIFE|INSUR/.test(c)) return 'Insurance';
  if (/PHAR|LAB|DRUG|CHEM/.test(c)) return 'Pharma';
  if (/TEX|SPIN|KNIT|DENIM|YARN|GARME/.test(c)) return 'Textile';
  if (/POWER|GAS|PETRO|OIL|ENERGY|CNG/.test(c)) return 'Energy';
  if (/MF|FUND|MUTUAL/.test(c)) return 'Mutual Fund';
  if (/CEM|CERAM/.test(c)) return 'Cement';
  if (/FOOD|FEED|MILK/.test(c)) return 'Food';
  if (/FIN|LEAS|CAP/.test(c)) return 'Finance';
  return 'General';
}

// ── Filter / Sort maps (server-side params) ────────────────────────────────────
const FILTER_MAP: Record<string, string> = {
  all: '',
  gainers: 'gainers',
  losers: 'losers',
  volume: 'volume',
};
const SORT_MAP: Record<string, string> = {
  all: 'volume',
  gainers: 'changePercent',
  losers: 'changePercent',
  volume: 'volume',
};

// ── Props ──────────────────────────────────────────────────────────────────────
interface MarketTabProps {
  mode: string;
  watchlist: string[];
  onToggleWatch: (symbol: string) => void;
  onSelectStock: (stock: MappedStock) => void;
  onBuy: (stock: MappedStock) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────
export const MarketTab: React.FC<MarketTabProps> = ({
  mode,
  watchlist,
  onToggleWatch,
  onSelectStock,
  onBuy,
}) => {
  const [filter, setFilter] = useState('all');
  const [newsFilter, setNewsFilter] = useState<'all' | 'market' | 'company'>('all');

  // ── RTK Query ─────────────────────────────────────────────────────────────
  const {
    data: apiResponse,   // apiResponse = { success, message, timestamp, data: [...] }
    isLoading,
    isError,
    refetch,
  } = useGetMarketDataQuery(
    { filter: FILTER_MAP[filter], sortBy: SORT_MAP[filter] },
    { pollingInterval: 60_000 },
  );

  const stocks = useMemo(() => {
    const raw = (apiResponse as unknown as ApiResponse)?.data;

    if (!raw || !Array.isArray(raw) || raw.length === 0) return [];

    const mapped = raw
      .filter(isValidStock)
      .map(toStock);

    if (filter === 'gainers') return mapped.filter(s => s.pct > 0).sort((a, b) => b.pct - a.pct);
    if (filter === 'losers') return mapped.filter(s => s.pct < 0).sort((a, b) => a.pct - b.pct);
    return [...mapped].sort((a, b) => b.vol - a.vol);
  }, [apiResponse, filter]);

  const stats = useMemo(() => ({
    advancing: stocks.filter(s => s.pct > 0).length,
    declining: stocks.filter(s => s.pct < 0).length,
    unchanged: stocks.filter(s => s.pct === 0).length,
    total: stocks.length,
  }), [stocks]);

  const movers = useMemo(() => {
    if (!stocks.length) return [];
    const gainers = [...stocks].filter(s => s.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, 3);
    const losers = [...stocks].filter(s => s.pct < 0).sort((a, b) => a.pct - b.pct).slice(0, 2);
    return [...gainers, ...losers];
  }, [stocks]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={{ color: colors.textSub, marginTop: 12, fontSize: 13 }}>
          Loading market data...
        </Text>
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 32, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 6 }}>
          Failed to load market
        </Text>
        <Text style={{ color: colors.textSub, fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
          Check your internet connection and try again.
        </Text>
        <TouchableOpacity
          onPress={refetch}
          style={{ backgroundColor: colors.blue, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 }}>
          <Text style={{ color: '#080C18', fontWeight: '600', fontSize: 14 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>

      {/* Quick Stats */}
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        {[
          { label: 'Advancing', val: stats.advancing, color: colors.gain },
          { label: 'Declining', val: stats.declining, color: colors.loss },
          { label: 'Unchanged', val: stats.unchanged, color: colors.textMuted },
          { label: 'Total', val: stats.total, color: colors.blue },
        ].map(s => (
          <View key={s.label} style={[globalStyles.cardSm, { padding: 10, alignItems: 'center', flex: 1 }]}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: s.color }}>{s.val}</Text>
            <Text style={{ fontSize: 10, color: colors.textSub, marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Top Movers */}
      {movers.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 12, color: colors.textSub, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' }}>
            Top Movers Today
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {movers.map(s => (
              <TouchableOpacity key={s.symbol} onPress={() => onSelectStock(s)} style={[globalStyles.cardSm, { padding: 10, minWidth: 110 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: colors.blue }}>{s.symbol}</Text>
                  <Badge type={s.pct >= 0 ? 'gain' : 'loss'} text={`${s.pct >= 0 ? '+' : ''}${s.pct.toFixed(2)}%`} style={{ paddingHorizontal: 4 }} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>৳{fmt(s.price)}</Text>
                <View style={{ marginTop: 4 }}>
                  <SparkLine data={s.spark} positive={s.pct >= 0} w={86} h={22} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', gap: 6 }}>
        {([
          ['all', 'All Stocks'],
          ['gainers', '🟢 Gainers'],
          ['losers', '🔴 Losers'],
          ['volume', '🔥 Volume'],
        ] as const).map(([v, label]) => (
          <TouchableOpacity
            key={v}
            onPress={() => setFilter(v)}
            style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: filter === v ? colors.activeTabBg : 'transparent' }}>
            <Text style={{ fontSize: 12, fontWeight: '500', color: filter === v ? colors.blue : colors.textSub }}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stock List */}
      {stocks.map(s => (
        <StockRow
          key={s.id}
          stock={s}
          onSelect={onSelectStock}
          isWatched={watchlist.includes(s.symbol)}
          onToggleWatch={onToggleWatch}
          onBuy={onBuy}
        />
      ))}

      {stocks.length === 0 && !isLoading && (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ color: colors.textSub, fontSize: 14 }}>No stocks found</Text>
        </View>
      )}

      {/* News */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Market News</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['all', 'market', 'company'] as const).map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setNewsFilter(t)}
                style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: newsFilter === t ? colors.activeTabBg : 'transparent' }}>
                <Text style={{ fontSize: 11, color: newsFilter === t ? colors.blue : colors.textSub }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {NEWS.filter(n => newsFilter === 'all' || n.cat === newsFilter).map(n => (
          <TouchableOpacity key={n.id} style={[globalStyles.cardSm, { marginBottom: 10, padding: 12, flexDirection: 'row', gap: 12 }]}>
            <View style={{ width: 70, height: 55, borderRadius: 8, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 22 }}>
                {n.cat === 'market' ? '📈' : n.cat === 'company' ? '🏢' : n.cat === 'economy' ? '🏦' : '📋'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Badge type={n.cat === 'market' ? 'blue' : n.cat === 'company' ? 'gain' : 'amber'} text={n.tag} style={{ alignSelf: 'flex-start', marginBottom: 5 }} />
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#C8D0E0', lineHeight: 18 }}>{n.title}</Text>
              <Text style={{ fontSize: 11, color: colors.textSub, marginTop: 5 }}>{n.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
};