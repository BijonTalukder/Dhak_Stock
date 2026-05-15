import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { colors, globalStyles } from '../theme';
import { useGetLeaderboardQuery, useGetUserRankQuery } from '../api/services/leaderboard/leaderboardApi';

const fmt = (n: number, dec: number = 2): string => n.toLocaleString('en-BD', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const LeaderboardTab: React.FC = () => {
  const { data: lbRes, isLoading: loadingList } = useGetLeaderboardQuery({ limit: 50, skip: 0 });
  const { data: myRankRes, isLoading: loadingMy } = useGetUserRankQuery();

  const entries = lbRes?.data || [];
  const myRank = myRankRes?.data || null;

  if (loadingList || loadingMy) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={{ color: colors.textSub, marginTop: 12, fontSize: 13 }}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={{ padding: 16 }}>
        <View style={[globalStyles.card, { padding: 20, marginBottom: 16, backgroundColor: '#0D1332', borderColor: '#2A3A6A' }]}>
          <Text style={{ fontSize: 11, color: colors.blue, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Your Ranking</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 36, fontWeight: '600', color: colors.text }}>
                {myRank ? `#${myRank.rank}` : '—'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSub, marginTop: 2 }}>
                of {lbRes?.pagination?.total || 0} traders
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, color: colors.textSub }}>Portfolio Value</Text>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.gain }}>
                ৳{fmt(myRank?.totalValue || 0)}
              </Text>
              {myRank && myRank.netPnL !== 0 && (
                <Text style={{ fontSize: 11, color: myRank.netPnL >= 0 ? colors.gain : colors.loss, marginTop: 2 }}>
                  {myRank.netPnL >= 0 ? '+' : ''}৳{fmt(Math.abs(myRank.netPnL))}
                </Text>
              )}
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 }}>Top Traders</Text>
        {entries.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: colors.textSub, fontSize: 14 }}>No traders yet</Text>
            <Text style={{ color: colors.textSub, fontSize: 12, marginTop: 6 }}>Start trading to be the first!</Text>
          </View>
        ) : entries.map((user) => {
          const isMe = myRank?.userId === user.userId;
          return (
            <View key={user.userId} style={[isMe ? globalStyles.card : globalStyles.cardSm, { padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: isMe ? '#2A3A6A' : colors.border }]}>
              <View style={{ width: 28, alignItems: 'center' }}>
                {user.rank <= 3 ? (
                  <Text style={{ fontSize: 18 }}>{['🥇', '🥈', '🥉'][user.rank - 1]}</Text>
                ) : (
                  <Text style={{ fontSize: 13, color: colors.textSub }}>#{user.rank}</Text>
                )}
              </View>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isMe ? '#1A3575' : '#131829', borderWidth: 1, borderColor: isMe ? '#2A4A8A' : colors.border, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: isMe ? colors.blue : colors.textSub }}>
                  {user.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: isMe ? colors.blue : colors.text }}>{user.name}</Text>
                <Text style={{ fontSize: 11, color: colors.textSub }}>{user.totalTrades} trades</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: user.netPnL >= 0 ? colors.gain : colors.loss }}>
                  ৳{fmt(Math.abs(user.netPnL))}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSub }}>PnL</Text>
              </View>
            </View>
          );
        })}
        <Text style={{ textAlign: 'center', paddingVertical: 16, fontSize: 12, color: colors.textSub }}>Virtual money only · Rankings update in real-time</Text>
      </View>
    </ScrollView>
  );
};
