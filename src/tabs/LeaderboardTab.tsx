import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, globalStyles } from '../theme';
import { LEADERBOARD_DATA, fmtVol, Holding } from '../data/fakeData';

interface LeaderboardTabProps {
  portfolio: Holding[];
  wallet: number;
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ portfolio, wallet }) => {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={{ padding: 16 }}>
        <View style={[globalStyles.card, { padding: 20, marginBottom: 16, backgroundColor: '#0D1332', borderColor: '#2A3A6A' }]}>
          <Text style={{ fontSize: 11, color: colors.blue, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Your Ranking</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 36, fontWeight: '600', color: colors.text }}>#8</Text>
              <Text style={{ fontSize: 12, color: colors.textSub, marginTop: 2 }}>of 2,847 traders</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, color: colors.textSub }}>Virtual Profit</Text>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.gain }}>৳0</Text>
              <Text style={{ fontSize: 11, color: colors.textSub, marginTop: 2 }}>Start trading to climb ranks!</Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 }}>🏆 Top Traders This Month</Text>
        {LEADERBOARD_DATA.map((user, i) => (
          <View key={user.rank} style={[user.isMe ? globalStyles.card : globalStyles.cardSm, { padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: user.isMe ? '#2A3A6A' : colors.border }]}>
            <View style={{ width: 28, alignItems: 'center' }}>
              {user.rank <= 3 ? (
                <Text style={{ fontSize: 18 }}>{['🥇', '🥈', '🥉'][user.rank - 1]}</Text>
              ) : (
                <Text style={{ fontSize: 13, color: colors.textSub }}>#{user.rank}</Text>
              )}
            </View>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: user.isMe ? '#1A3575' : '#131829', borderWidth: 1, borderColor: user.isMe ? '#2A4A8A' : colors.border, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: user.isMe ? colors.blue : colors.textSub }}>{user.avatar}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: user.isMe ? colors.blue : colors.text }}>{user.name}</Text>
              <Text style={{ fontSize: 11, color: colors.textSub }}>{user.trades} trades</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: user.profit >= 0 ? colors.gain : colors.loss }}>
                {user.profit === 0 ? '৳0' : `+৳${fmtVol(user.profit)}`}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSub }}>{user.profit === 0 ? '—' : `+${user.pct.toFixed(2)}%`}</Text>
            </View>
          </View>
        ))}
        <Text style={{ textAlign: 'center', paddingVertical: 16, fontSize: 12, color: colors.textSub }}>Updates every 24 hours · Virtual money only</Text>
      </View>
    </ScrollView>
  );
};
