import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, globalStyles } from '../theme';
import { fmt, Holding } from '../data/fakeData';
import { Button } from '../components/SharedComponents';
import { useGetMarketDataQuery, type StockItemMarket } from '../api/services/market/marketApi';

interface ApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: StockItemMarket[];
}

interface PortfolioTabProps {
  portfolio: Holding[];
  wallet: number;
  onBuy: (stock: any) => void;
  onSell: (stock: any, holding: Holding) => void;
}

interface EnrichedHolding extends Holding {
  name: string;
  sector: string;
  ltp: number;
  change: number;
  changePercent: number;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({ portfolio, wallet, onBuy, onSell }) => {
  const { data: apiResponse } = useGetMarketDataQuery({ filter: '', sortBy: '' });

  const marketMap = React.useMemo(() => {
    const map = new Map<string, StockItemMarket>();
    const raw = (apiResponse as unknown as ApiResponse)?.data;
    if (raw && Array.isArray(raw)) {
      raw.forEach((item: StockItemMarket) => map.set(item.stockCode, item));
    }
    return map;
  }, [apiResponse]);

  const enriched: EnrichedHolding[] = portfolio.map(h => {
    const m = marketMap.get(h.symbol);
    const ltp = m?.prices?.ltp ?? h.avgPrice;
    const change = m?.prices?.change ?? 0;
    const changePercent = m?.prices?.changePercent ?? 0;
    return {
      ...h,
      name: m?.stockName || h.symbol,
      sector: m?.sector || '',
      ltp,
      change,
      changePercent,
      spark: [],
    };
  });

  const totalInvested = enriched.reduce((s, h) => s + h.avgPrice * h.qty, 0);
  const currentVal = enriched.reduce((s, h) => s + h.ltp * h.qty, 0);
  const totalPL = currentVal - totalInvested;
  const totalPLPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={{ padding: 16 }}>
        <View style={[globalStyles.card, { padding: 20, marginBottom: 14 }]}>
          <Text style={{ fontSize: 11, color: colors.textSub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Total Portfolio Value</Text>
          <Text style={{ fontSize: 28, fontWeight: '600', color: colors.text, marginBottom: 6 }}>৳{fmt(wallet + currentVal)}</Text>
          <View style={{ flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14, marginTop: 10 }}>
            {[
              { label: 'Cash Available', val: `৳${fmt(wallet)}`, color: colors.blue },
              { label: 'Invested', val: `৳${fmt(totalInvested)}`, color: colors.textMuted },
              { label: 'P&L', val: `${totalPL >= 0 ? '+' : ''}৳${fmt(Math.abs(totalPL))}`, color: totalPL >= 0 ? colors.gain : colors.loss },
            ].map(s => (
              <View key={s.label}>
                <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 3 }}>{s.label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: s.color }}>{s.val}</Text>
              </View>
            ))}
          </View>
          {totalInvested > 0 && (
            <View style={{ marginTop: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ fontSize: 11, color: colors.textSub }}>Performance</Text>
                <Text style={{ fontSize: 11, color: totalPL >= 0 ? colors.gain : colors.loss }}>{totalPL >= 0 ? '+' : ''}{totalPLPct.toFixed(2)}%</Text>
              </View>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.border }}>
                <View style={{ height: '100%', borderRadius: 2, width: `${Math.min(100, Math.abs(totalPLPct) * 2)}%`, backgroundColor: totalPL >= 0 ? colors.gain : colors.loss }} />
              </View>
            </View>
          )}
        </View>

        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 }}>Holdings ({portfolio.length})</Text>
        {portfolio.length === 0 ? (
          <View style={[globalStyles.card, { padding: 40, alignItems: 'center' }]}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📂</Text>
            <Text style={{ color: colors.textSub, fontSize: 14 }}>No holdings yet</Text>
            <Text style={{ color: colors.textSub, fontSize: 12, marginTop: 6 }}>Buy stocks from the Market tab to start trading</Text>
          </View>
        ) : enriched.map(h => {
          const currentValue = h.ltp * h.qty;
          const invested = h.avgPrice * h.qty;
          const pl = currentValue - invested;
          const plPct = (pl / invested) * 100;
          return (
            <View key={h.symbol} style={[globalStyles.card, { padding: 14, marginBottom: 10 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#131829', borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 8, fontWeight: '600', color: colors.blue, textAlign: 'center' }}>{h.symbol}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{h.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textSub }}>{h.qty} shares · Avg ৳{fmt(h.avgPrice)}</Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>Current</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>৳{fmt(currentValue)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>LTP</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>৳{fmt(h.ltp)}</Text>
                </View>
                <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>P&L</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: pl >= 0 ? colors.gain : colors.loss }}>
                    {pl >= 0 ? '+' : ''}৳{fmt(Math.abs(pl))} ({plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%)
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <Button title="Buy More" onPress={() => onBuy({ symbol: h.symbol, name: h.name, price: h.ltp, change: h.change, pct: h.changePercent })} style={{ flex: 1, height: 34 }} />
                <Button title="Sell" onPress={() => onSell({ symbol: h.symbol, name: h.name, price: h.ltp, change: h.change, pct: h.changePercent }, h)} type="red" style={{ flex: 1, height: 34 }} />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};
