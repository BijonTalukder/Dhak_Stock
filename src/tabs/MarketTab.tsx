import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors, globalStyles } from '../theme';
import { STOCKS, NEWS, fmt, Stock } from '../data/fakeData';
import { SparkLine } from '../components/SparkLine';
import { StockRow, Badge } from '../components/SharedComponents';

interface MarketTabProps {
  mode: string;
  watchlist: string[];
  onToggleWatch: (symbol: string) => void;
  onSelectStock: (stock: Stock) => void;
  onBuy: (stock: Stock) => void;
}

export const MarketTab: React.FC<MarketTabProps> = ({ mode, watchlist, onToggleWatch, onSelectStock, onBuy }) => {
  const [filter, setFilter] = useState('all');
  const [newsFilter, setNewsFilter] = useState('all');

  const filtered = useMemo(() => {
    let s = [...STOCKS];
    if (filter === 'gainers') s = s.filter(x => x.pct > 0).sort((a, b) => b.pct - a.pct);
    else if (filter === 'losers') s = s.filter(x => x.pct < 0).sort((a, b) => a.pct - b.pct);
    else if (filter === 'volume') s = s.sort((a, b) => b.vol - a.vol);
    else s = s.sort((a, b) => b.vol - a.vol);
    return s;
  }, [filter]);

  const topGainers = [...STOCKS].filter(s => s.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, 5);
  const topLosers = [...STOCKS].filter(s => s.pct < 0).sort((a, b) => a.pct - b.pct).slice(0, 5);
  const movers = [...topGainers.slice(0,3), ...topLosers.slice(0,2)];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        {[
          { label: 'Advancing', val: 142, color: colors.gain },
          { label: 'Declining', val: 108, color: colors.loss },
          { label: 'Unchanged', val: 34, color: colors.textMuted },
          { label: 'Total', val: 284, color: colors.blue },
        ].map(s => (
          <View key={s.label} style={[globalStyles.cardSm, { padding: 10, alignItems: 'center', flex: 1 }]}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: s.color }}>{s.val}</Text>
            <Text style={{ fontSize: 10, color: colors.textSub, marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 12, color: colors.textSub, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' }}>Top Movers Today</Text>
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

      <View style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', gap: 6 }}>
        {[['all','All Stocks'],['gainers','🟢 Gainers'],['losers','🔴 Losers'],['volume','🔥 Volume']].map(([v, label]) => (
          <TouchableOpacity key={v} onPress={() => setFilter(v)} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: filter === v ? colors.activeTabBg : 'transparent' }}>
            <Text style={{ fontSize: 12, fontWeight: '500', color: filter === v ? colors.blue : colors.textSub }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.map(s => (
        <StockRow key={s.id} stock={s} onSelect={onSelectStock} isWatched={watchlist.includes(s.symbol)} onToggleWatch={onToggleWatch} onBuy={onBuy} />
      ))}

      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Market News</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
             {['all','market','company'].map(t => (
               <TouchableOpacity key={t} onPress={() => setNewsFilter(t as any)} style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: newsFilter === t ? colors.activeTabBg : 'transparent' }}>
                 <Text style={{ fontSize: 11, color: newsFilter === t ? colors.blue : colors.textSub }}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
               </TouchableOpacity>
             ))}
          </View>
        </View>
        {NEWS.filter(n => newsFilter === 'all' || n.cat === newsFilter).map(n => (
          <TouchableOpacity key={n.id} style={[globalStyles.cardSm, { marginBottom: 10, padding: 12, flexDirection: 'row', gap: 12 }]}>
            <View style={{ width: 70, height: 55, borderRadius: 8, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 22 }}>{n.cat === 'market' ? '📈' : n.cat === 'company' ? '🏢' : n.cat === 'economy' ? '🏦' : '📋'}</Text>
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
