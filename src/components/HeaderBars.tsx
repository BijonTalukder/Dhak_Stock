import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Text, View } from 'react-native';
import { StockItem, useGetTopbarDataQuery } from '../api/services/market/marketApi';
import { DSES, DSEX, fmt, STOCKS } from '../data/fakeData';
import { colors } from '../theme';
import { LiveDot } from './SharedComponents';

type TickerEntry = {
  _id?: string;
  symbol?: string;
  name?: string;
  price?: { ltp?: number; change?: number } | number;
};

export const TickerBar: React.FC = () => {
  const isFocused = useIsFocused();
  const { data: stocks, isLoading, isError, isSuccess } =
    useGetTopbarDataQuery(undefined, {
      pollingInterval: isFocused ? 60000 : 0,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  const translateX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);


  const data: TickerEntry[] = useMemo(() => {
    if (isSuccess && stocks?.length) {
      return stocks;
    }
    return STOCKS.map(s => ({
      _id: String(s.id),
      symbol: s.symbol,
      name: s.name,
      price: { ltp: s.price, change: s.change },
    }));
  }, [isSuccess, stocks]);


  const content = useMemo(() => [...data, ...data], [data]);


  useEffect(() => {
    if (!contentWidth) return;

    translateX.setValue(0);

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -contentWidth,
        duration: Math.max(20000, contentWidth * 20), // dynamic speed
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [contentWidth, translateX]);


  const isActive = () => {

  }
  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;

    if (width && width !== contentWidth * 2) {
      setContentWidth(width / 2);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        overflow: 'hidden',
        paddingVertical: 6,
      }}
    >
      <Animated.View
        onLayout={handleLayout}
        style={{
          flexDirection: 'row',
          transform: [{ translateX }],
        }}
      >
        {content.map((s, i) => {
          const priceObj = typeof s.price === 'object' ? s.price : { ltp: s.price, change: 0 };
          const change = priceObj?.change ?? 0;
          const ltp = priceObj?.ltp ?? 0;
          const isGain = change >= 0;

          return (
            <View
              key={`${s._id || s.symbol || i}-${i}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginRight: 32,
              }}
            >
              {/* Name */}
              <Text
                style={{
                  color: colors.textMuted,
                  fontWeight: '500',
                  fontSize: 12,
                }}
              >
                {s.name || s.symbol}
              </Text>

              {/* Price */}
              <Text
                style={{
                  color: isGain ? colors.gain : colors.loss,
                  fontSize: 12,
                }}
              >
                {fmt(ltp)}
              </Text>

              {/* Change */}
              <Text
                style={{
                  color: isGain ? colors.gain : colors.loss,
                  fontSize: 11,
                }}
              >
                {isGain ? '+' : ''}
                {change.toFixed(2)}
              </Text>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}
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