import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { colors } from '../theme';
import { STOCKS, fmt, DSEX, DSES } from '../data/fakeData';
import { LiveDot } from './SharedComponents';

export const TickerBar: React.FC = () => {
  const items = STOCKS.slice(0, 12);
  const content = [...items, ...items];
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -1000,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  return (
    <View style={{ backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border, overflow: 'hidden', paddingVertical: 6 }}>
      <Animated.View style={{ flexDirection: 'row', transform: [{ translateX }] }}>
        {content.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 32 }}>
            <Text style={{ color: colors.textMuted, fontWeight: '500', fontSize: 12 }}>{s.symbol}</Text>
            <Text style={{ color: s.pct >= 0 ? colors.gain : colors.loss, fontSize: 12 }}>{fmt(s.price)}</Text>
            <Text style={{ color: s.pct >= 0 ? colors.gain : colors.loss, fontSize: 11 }}>{s.pct >= 0 ? '+' : ''}{s.pct.toFixed(2)}%</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export const DSEXBar: React.FC = () => (
  <View style={{ backgroundColor: colors.headerBg, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10, paddingHorizontal: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <LiveDot />
        <View>
          <Text style={{ fontSize: 10, color: colors.textSub, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>DSEX</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>{fmt(DSEX.value)}</Text>
            <Text style={{ fontSize: 12, color: colors.gain }}>+{fmt(DSEX.change)} (+{DSEX.pct}%)</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 10, color: colors.textSub }}>DSES</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
             <Text style={{ fontSize: 13, color: colors.loss }}>{fmt(DSES.value)} </Text>
             <Text style={{ fontSize: 11, color: colors.loss }}>{DSES.pct}%</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 10, color: colors.textSub }}>Volume</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>{DSEX.vol}</Text>
        </View>
      </View>
    </View>
  </View>
);
