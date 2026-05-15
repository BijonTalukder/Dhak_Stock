import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { colors, globalStyles } from '../theme';
import { STOCKS, fmt } from '../data/fakeData';
import { SparkLine } from '../components/SparkLine';
import { Badge, Button } from '../components/SharedComponents';
import { MappedStock } from './MarketTab';

interface WatchlistTabProps {
  watchlist: string[];
  onToggleWatch: (symbol: string) => void;
  onSelectStock: (stock: MappedStock) => void;
  onBuy: (stock: MappedStock) => void;
}

export const WatchlistTab: React.FC<WatchlistTabProps> = ({ watchlist, onToggleWatch, onSelectStock, onBuy }) => {
  const [alertSymbol, setAlertSymbol] = useState<string | null>(null);
  const [alertPrice, setAlertPrice] = useState('');
  const [alerts, setAlerts] = useState<{ symbol: string; price: number; dir: string; id: number }[]>([]);

  const watched = STOCKS.filter(s => watchlist.includes(s.symbol));

  const addAlert = (symbol: string) => {
    if (!alertPrice) return;
    setAlerts(prev => [...prev, { symbol, price: parseFloat(alertPrice), dir: 'above', id: Date.now() }]);
    setAlertSymbol(null); setAlertPrice('');
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Watchlist ({watched.length})</Text>
          <Text style={{ fontSize: 12, color: colors.textSub }}>★ to add from Market</Text>
        </View>

        {watched.length === 0 ? (
          <View style={[globalStyles.card, { padding: 40, alignItems: 'center' }]}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⭐</Text>
            <Text style={{ color: colors.textSub, fontSize: 14 }}>Your watchlist is empty</Text>
            <Text style={{ color: colors.textSub, fontSize: 12, marginTop: 6 }}>Tap the ★ next to any stock to add it here</Text>
          </View>
        ) : watched.map(s => (
          <View key={s.symbol} style={[globalStyles.card, { marginBottom: 10, padding: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity onPress={() => onSelectStock(s)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: '#131829', borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 8, fontWeight: '600', color: colors.blue }}>{s.symbol}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{s.name}</Text>
                  <Text style={{ fontSize: 11, color: colors.textSub }}>{s.sector}</Text>
                </View>
                <SparkLine data={s.spark} positive={s.pct >= 0} />
                <View style={{ alignItems: 'flex-end', minWidth: 70 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>৳{fmt(s.price)}</Text>
                  <Badge type={s.pct >= 0 ? 'gain' : 'loss'} text={`${s.pct >= 0 ? '+' : ''}${s.pct.toFixed(2)}%`} style={{ marginTop: 3 }} />
                </View>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 6, marginLeft: 4 }}>
                <TouchableOpacity onPress={() => setAlertSymbol(alertSymbol === s.symbol ? null : s.symbol)} style={styles.watchBtn}>
                  <Text style={{ fontSize: 14 }}>🔔</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onToggleWatch(s.symbol)} style={styles.watchBtn}>
                  <Text style={{ fontSize: 14, color: colors.loss }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            {alertSymbol === s.symbol && (
              <View style={{ marginTop: 10, padding: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ fontSize: 11, color: colors.textSub, marginBottom: 6 }}>Set price alert for {s.symbol}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput 
                    style={styles.input} 
                    keyboardType="numeric" 
                    placeholder={`Current: ৳${s.price}`} 
                    placeholderTextColor={colors.textSub}
                    value={alertPrice}
                    onChangeText={setAlertPrice}
                  />
                  <Button title="Set Alert" onPress={() => addAlert(s.symbol)} type="amber" style={{ height: 36, paddingHorizontal: 14 }} />
                </View>
              </View>
            )}
            <Button title="Buy" onPress={() => onBuy(s)} style={{ marginTop: 10, height: 32 }} />
          </View>
        ))}

        {alerts.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', marginBottom: 10, color: colors.amber }}>🔔 Active Alerts</Text>
            {alerts.map(a => (
              <View key={a.id} style={[globalStyles.cardSm, { padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: colors.blue, fontWeight: '600' }}>{a.symbol}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 8 }}>Alert at ৳{fmt(a.price)}</Text>
                </View>
                <TouchableOpacity onPress={() => setAlerts(prev => prev.filter(x => x.id !== a.id))}>
                  <Text style={{ color: colors.textSub, fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  watchBtn: { width: 30, height: 30, borderRadius: 7, backgroundColor: '#1A2240', justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, backgroundColor: colors.card, borderEndWidth: 1.5, borderColor: colors.border, borderRadius: 10, color: colors.text, paddingHorizontal: 10, fontSize: 13, height: 36, borderWidth: 1 }
});
