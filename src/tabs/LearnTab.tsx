import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors, globalStyles } from '../theme';
import { LEARN_MODULES } from '../data/fakeData';
import { Button, Badge } from '../components/SharedComponents';

const lessonsData: Record<number, string[]> = {
  1: ['What is the Dhaka Stock Exchange (DSE)?', 'Types of securities: shares, bonds, mutual funds', 'How share prices are determined', 'IPO: Initial Public Offerings explained', 'Market hours: DSE trading sessions', 'Bull vs Bear markets', 'Key market indices: DSEX, DSES, DS30', 'How to read a stock quote'],
  2: ['Reading a candlestick chart', 'Support and resistance levels', 'Trend identification', 'Chart patterns: Head & Shoulders, Double Top', 'Volume analysis basics', 'Moving averages on charts'],
  3: ['Simple Moving Average (SMA)', 'Exponential Moving Average (EMA)', 'RSI: Relative Strength Index', 'MACD: Moving Average Convergence/Divergence', 'Bollinger Bands explained', 'Stochastic Oscillator', 'Using indicators together'],
  4: ['What is risk in investing?', 'Stop-loss orders explained', 'Position sizing: how much to invest', 'Portfolio diversification strategy', 'Emotional discipline in trading'],
  5: ['Understanding P/E ratio', 'Earnings Per Share (EPS)', 'Dividend yield analysis', 'Book value and P/B ratio', 'Reading company annual reports', 'Cash flow analysis basics', 'Sector analysis', 'Comparing company fundamentals', 'Valuation methods'],
  6: ['What is swing trading?', 'Scalping strategy explained', 'Value investing principles', 'Momentum trading approach', 'Dollar-cost averaging', 'Contrarian investing', 'Event-driven trading', 'Risk-to-reward ratios', 'Building a trading plan', 'Backtesting your strategy'],
};

export const LearnTab: React.FC = () => {
  const [openModule, setOpenModule] = useState<number | null>(null);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>📚 Learning Center</Text>
        <Text style={{ fontSize: 12, color: colors.textSub, marginBottom: 16 }}>Master stock trading from basics to advanced strategies</Text>

        <View style={[globalStyles.card, { padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }]}>
          <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.blue }}>0%</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Overall Progress</Text>
            <Text style={{ fontSize: 12, color: colors.textSub }}>0 of 45 lessons completed</Text>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.border, marginTop: 6 }}>
              <View style={{ height: '100%', borderRadius: 2, width: '0%', backgroundColor: colors.gain }} />
            </View>
          </View>
        </View>

        {LEARN_MODULES.map(m => (
          <View key={m.id} style={[globalStyles.card, { marginBottom: 10, overflow: 'hidden' }]}>
            <TouchableOpacity onPress={() => setOpenModule(openModule === m.id ? null : m.id)} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: `${m.color}18`, borderWidth: 1, borderColor: `${m.color}30`, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20 }}>{m.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 }}>{m.title}</Text>
                <Text style={{ fontSize: 11, color: colors.textSub }}>{m.lessons} lessons · {m.desc.slice(0, 45)}...</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge type="blue" text={`0/${m.lessons}`} style={{ alignSelf: 'flex-end' }} />
                <Text style={{ color: colors.textSub, fontSize: 18 }}>{openModule === m.id ? '▲' : '▼'}</Text>
              </View>
            </TouchableOpacity>
            {openModule === m.id && (
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                {lessonsData[m.id]?.map((lesson, i) => (
                  <TouchableOpacity key={i} style={{ padding: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#0B0F1C' }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#111829', borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 9, color: colors.textSub }}>{i + 1}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: colors.textMuted, flex: 1 }}>{lesson}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSub }}>▶</Text>
                  </TouchableOpacity>
                ))}
                <View style={{ padding: 16 }}>
                  <Button title="Start Module" onPress={() => {}} type="outline" style={{ height: 36 }} />
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
