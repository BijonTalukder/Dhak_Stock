import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, globalStyles } from '../theme';
import { STOCKS, fmt, Holding, Stock } from '../data/fakeData';
import { SparkLine } from '../components/SparkLine';
import { Button } from '../components/SharedComponents';

interface PortfolioTabProps {
  portfolio: Holding[];
  wallet: number;
  onBuy: (stock: Stock) => void;
  onSell: (stock: Stock, holding: Holding) => void;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({ portfolio, wallet, onBuy, onSell }) => {
  const totalInvested = portfolio.reduce((s, h) => s + h.avgPrice * h.qty, 0);
  const currentVal = portfolio.reduce((s, h) => {
    const st = STOCKS.find(x => x.symbol === h.symbol);
    return s + (st ? st.price * h.qty : 0);
  }, 0);
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
        ) : portfolio.map(h => {
          const st = STOCKS.find(s => s.symbol === h.symbol);
          if (!st) return null;
          const currentValue = st.price * h.qty;
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
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{st.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textSub }}>{h.qty} shares · Avg ৳{fmt(h.avgPrice)}</Text>
                  </View>
                </View>
                <SparkLine data={st.spark} positive={st.pct >= 0} w={56} h={24} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>Current</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>৳{fmt(currentValue)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>LTP</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>৳{fmt(st.price)}</Text>
                </View>
                <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>P&L</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: pl >= 0 ? colors.gain : colors.loss }}>
                    {pl >= 0 ? '+' : ''}৳{fmt(Math.abs(pl))} ({plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%)
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <Button title="Buy More" onPress={() => onBuy(st)} style={{ flex: 1, height: 34 }} />
                <Button title="Sell" onPress={() => onSell(st, h)} type="red" style={{ flex: 1, height: 34 }} />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};
