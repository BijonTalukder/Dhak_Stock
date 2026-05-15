import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { fmt, fmtVol } from '../data/fakeData';
import { colors } from '../theme';
import { SparkLine } from './SparkLine';

/**
 * ✅ UI-safe stock type (API mapped)
 */
export type UIStock = {
  symbol: string;
  name: string;
  sector?: string;
  price: number;
  change: number;
  pct: number;
  vol: number;
  spark?: number[];
};

/**
 * 🔴 Live blinking dot
 */
export const LiveDot: React.FC = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop(); // ✅ prevent memory leak
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        width: 7,
        height: 7,
        backgroundColor: colors.gain,
        borderRadius: 3.5,
      }}
    />
  );
};

/**
 * 🟢 Badge
 */
interface BadgeProps {
  type: 'gain' | 'loss' | 'amber' | 'blue';
  text: string;
  style?: ViewStyle | ViewStyle[];
}

export const Badge: React.FC<BadgeProps> = ({ type, text, style }) => {
  let bg = colors.blueBg;
  let color = colors.blue;

  if (type === 'gain') {
    bg = colors.gainBg;
    color = colors.gain;
  } else if (type === 'loss') {
    bg = colors.lossBg;
    color = colors.loss;
  } else if (type === 'amber') {
    bg = colors.amberBg;
    color = colors.amber;
  }

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 20,
        },
        style,
      ]}
    >
      <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{text}</Text>
    </View>
  );
};

/**
 * 🔘 Button
 */
interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'red' | 'amber' | 'outline';
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  style,
  disabled,
}) => {
  let bg = colors.gain;
  let color = colors.bg;

  if (type === 'red') {
    bg = colors.loss;
    color = '#fff';
  } else if (type === 'amber') {
    bg = colors.amber;
    color = colors.bg;
  } else if (type === 'outline') {
    bg = 'transparent';
    color = colors.textMuted;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor: bg,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 10,
          paddingVertical: 10,
          opacity: disabled ? 0.4 : 1,
          borderWidth: type === 'outline' ? 1.5 : 0,
          borderColor:
            type === 'outline' ? colors.border : 'transparent',
        },
        style,
      ]}
    >
      <Text style={{ color, fontWeight: '600', fontSize: 14 }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * 📈 Stock Row (Main Component)
 */
interface StockRowStock {
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

interface StockRowProps {
  stock: StockRowStock;
  onSelect: (stock: StockRowStock) => void;
  isWatched: boolean;
  onToggleWatch: (symbol: string) => void;
  onBuy: (stock: StockRowStock) => void;
}

export const StockRow = memo(
  ({ stock, onSelect, isWatched, onToggleWatch, onBuy }: StockRowProps) => {
    const isGain = stock.pct >= 0;

    return (
      <TouchableOpacity
        onPress={() => onSelect(stock)}
        style={styles.stockRow}
      >
        {/* Symbol + Name + Sector */}
        <View style={styles.symbolBox}>
          <Text style={styles.symbolText}>{stock.symbol}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>{stock.name}</Text>

          <Text style={styles.subText}>
            {stock.sector || '—'} · Vol {fmtVol(stock.vol)}
          </Text>
        </View>

        {/* Sparkline */}
        <View style={{ marginRight: 12 }}>
          <SparkLine data={stock.spark || []} positive={isGain} />
        </View>

        {/* Price + % */}
        <View style={{ alignItems: 'flex-end', minWidth: 72 }}>
          <Text style={styles.price}>৳{fmt(stock.price)}</Text>

          <Badge
            type={isGain ? 'gain' : 'loss'}
            text={`${isGain ? '+' : ''}${stock.pct.toFixed(2)}%`}
            style={{ marginTop: 3 }}
          />
        </View>

        {/* Actions */}
        <View style={{ marginLeft: 12, gap: 4 }}>
          <TouchableOpacity
            onPress={() => onToggleWatch(stock.symbol)}
          >
            <Text
              style={{
                fontSize: 16,
                color: isWatched
                  ? colors.amber
                  : colors.textSub,
                textAlign: 'center',
              }}
            >
              ★
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onBuy(stock)}
            style={styles.buyBtn}
          >
            <Text style={styles.buyText}>BUY</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
);

/**
 * 🎨 Styles
 */
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
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#131829',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.blue,
    textAlign: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  subText: {
    fontSize: 12,
    color: colors.textSub,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  buyBtn: {
    backgroundColor: colors.activeTabBg,
    borderWidth: 1,
    borderColor: '#2E3A60',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  buyText: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '600',
  },
});