import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { colors } from '../theme';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mode: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, mode }) => {
  const tabs = [
    { id: 'market', label: 'Market', icon: '📊' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼', locked: mode === 'guest' },
    { id: 'watchlist', label: 'Watchlist', icon: '⭐', locked: mode === 'guest' },
    { id: 'leaderboard', label: 'Ranking', icon: '🏆' },
    { id: 'learn', label: 'Learn', icon: '📚' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {tabs.map(t => (
          <TouchableOpacity key={t.id} onPress={() => setActiveTab(t.id)} style={styles.tabBtn}>
            <View style={{ position: 'relative' }}>
              <Text style={{ fontSize: 20, color: activeTab === t.id ? colors.blue : colors.textSub }}>{t.icon}</Text>
              {t.locked && <View style={styles.lockDot}><Text style={{ color: '#080C18', fontSize: 6 }}>🔒</Text></View>}
            </View>
            <Text style={[styles.label, { color: activeTab === t.id ? colors.blue : colors.textSub, fontWeight: activeTab === t.id ? '600' : '400' }]}>{t.label}</Text>
            {activeTab === t.id && <View style={styles.activeLine} />}
          </TouchableOpacity>
        ))}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: colors.headerBg, borderTopWidth: 1, borderTopColor: colors.border },
  safeArea: { flexDirection: 'row', paddingBottom: Platform.OS === 'ios' ? 0 : 8 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 4 },
  label: { fontSize: 10 },
  lockDot: { position: 'absolute', top: -2, right: -4, backgroundColor: colors.amber, borderRadius: 4, width: 8, height: 8, justifyContent: 'center', alignItems: 'center' },
  activeLine: { position: 'absolute', top: 0, width: 24, height: 2, backgroundColor: colors.blue, borderRadius: 2 }
});
