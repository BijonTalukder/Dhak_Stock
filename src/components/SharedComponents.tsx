import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme';
import { SparkLine } from './SparkLine';
import { fmt, fmtVol, Stock } from '../data/fakeData';

export const LiveDot: React.FC = () => {
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(op, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [op]);
  return <Animated.View style={{ opacity: op, width: 7, height: 7, backgroundColor: colors.gain, borderRadius: 3.5 }} />;
};

interface BadgeProps {
  type: 'gain' | 'loss' | 'amber' | 'blue';
  text: string;
  style?: ViewStyle | ViewStyle[];
}

export const Badge: React.FC<BadgeProps> = ({ type, text, style }) => {
  let bg = colors.blueBg, color = colors.blue;
  if (type === 'gain') { bg = colors.gainBg; color = colors.gain; }
  else if (type === 'loss') { bg = colors.lossBg; color = colors.loss; }
  else if (type === 'amber') { bg = colors.amberBg; color = colors.amber; }
  
  return (
    <View style={[{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }, style]}>
      <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{text}</Text>
    </View>
  );
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'red' | 'amber' | 'outline';
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, type = 'primary', style, disabled }) => {
  let bg = colors.gain;
  let color = colors.bg;
  if (type === 'red') { bg = colors.loss; color = '#fff'; }
  else if (type === 'amber') { bg = colors.amber; color = colors.bg; }
  else if (type === 'outline') { bg = 'transparent'; color = colors.textMuted; }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={[{ 
        backgroundColor: bg, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderRadius: 10,
        opacity: disabled ? 0.4 : 1,
        borderWidth: type === 'outline' ? 1.5 : 0,
        borderColor: type === 'outline' ? colors.border : 'transparent',
      }, style]}>
      <Text style={{ color, fontWeight: '600', fontSize: 14 }}>{title}</Text>
    </TouchableOpacity>
  );
};

interface StockRowProps {
  stock: Stock;
  onSelect: (stock: Stock) => void;
  isWatched: boolean;
  onToggleWatch: (symbol: string) => void;
  onBuy: (stock: Stock) => void;
}

export const StockRow: React.FC<StockRowProps> = ({ stock, onSelect, isWatched, onToggleWatch, onBuy }) => (
  <TouchableOpacity onPress={() => onSelect(stock)} style={styles.stockRow}>
    <View style={styles.symbolBox}>
      <Text style={styles.symbolText}>{stock.symbol}</Text>
    </View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 }}>{stock.name}</Text>
      <Text style={{ fontSize: 12, color: colors.textSub }}>{stock.sector} · Vol {fmtVol(stock.vol)}</Text>
    </View>
    <View style={{ marginRight: 12 }}>
      <SparkLine data={stock.spark} positive={stock.pct >= 0} />
    </View>
    <View style={{ alignItems: 'flex-end', minWidth: 72 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>৳{fmt(stock.price)}</Text>
      <Badge type={stock.pct >= 0 ? 'gain' : 'loss'} text={`${stock.pct >= 0 ? '+' : ''}${stock.pct.toFixed(2)}%`} style={{ marginTop: 3 }} />
    </View>
    <View style={{ marginLeft: 12, gap: 4 }}>
      <TouchableOpacity onPress={() => onToggleWatch(stock.symbol)}>
        <Text style={{ fontSize: 16, color: isWatched ? colors.amber : colors.textSub, textAlign: 'center' }}>★</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onBuy(stock)} style={{ backgroundColor: colors.activeTabBg, borderWidth: 1, borderColor: '#2E3A60', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 }}>
        <Text style={{ color: colors.blue, fontSize: 11, fontWeight: '600' }}>BUY</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  symbolBox: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#131829', borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center'
  },
  symbolText: { fontSize: 9, fontWeight: '600', color: colors.blue, textAlign: 'center' }
});
