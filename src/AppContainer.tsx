import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar as RNStatusBar } from 'react-native';
import { colors, globalStyles } from './theme';
import { TickerBar, DSEXBar } from './components/HeaderBars';
import { BottomNav } from './components/BottomNav';
import { MarketTab } from './tabs/MarketTab';
import { PortfolioTab } from './tabs/PortfolioTab';
import { WatchlistTab } from './tabs/WatchlistTab';
import { LeaderboardTab } from './tabs/LeaderboardTab';
import { LearnTab } from './tabs/LearnTab';
import { LoginModal, StockDetailModal, BuySellModal } from './components/Modals';
import { Badge } from './components/SharedComponents';
import { Stock, Holding } from './data/fakeData';

export default function AppContainer() {
  const [mode, setMode] = useState('guest'); // guest | free | premium
  const [activeTab, setActiveTab] = useState('market');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [buySellData, setBuySellData] = useState<{ stock: Stock; isSell: boolean; holding: Holding | null } | null>(null);
  const [pendingBuyStock, setPendingBuyStock] = useState<Stock | null>(null);
  const [wallet, setWallet] = useState(100000);
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [watchlist, setWatchlist] = useState(['GP', 'SQUAREPH']);
  const [userName, setUserName] = useState('Trader');

  const handleLogin = useCallback((name: string) => {
    setMode('free');
    setUserName(name);
    setShowLogin(false);
    if (pendingBuyStock) {
      setBuySellData({ stock: pendingBuyStock, isSell: false, holding: null });
      setPendingBuyStock(null);
    }
  }, [pendingBuyStock]);

  const handleBuy = useCallback((stock: Stock) => {
    if (mode === 'guest') {
      setPendingBuyStock(stock);
      setShowLogin(true);
      return;
    }
    const holding = portfolio.find(h => h.symbol === stock.symbol) || null;
    setBuySellData({ stock, isSell: false, holding });
  }, [mode, portfolio]);

  const handleSell = useCallback((stock: Stock, holding: Holding) => {
    setBuySellData({ stock, isSell: true, holding });
  }, []);

  const handleTrade = useCallback((stock: Stock, qty: number, isSell: boolean) => {
    const cost = stock.price * qty;
    const fee = cost * 0.005;
    if (isSell) {
      const holding = portfolio.find(h => h.symbol === stock.symbol);
      if (!holding || holding.qty < qty) return;
      const received = cost - fee;
      setWallet(w => w + received);
      setPortfolio(prev => prev.map(h => h.symbol === stock.symbol ? { ...h, qty: h.qty - qty } : h).filter(h => h.qty > 0));
    } else {
      const totalCost = cost + fee;
      if (totalCost > wallet) return;
      setWallet(w => w - totalCost);
      setPortfolio(prev => {
        const existing = prev.find(h => h.symbol === stock.symbol);
        if (existing) {
          const newQty = existing.qty + qty;
          const newAvg = (existing.avgPrice * existing.qty + stock.price * qty) / newQty;
          return prev.map(h => h.symbol === stock.symbol ? { ...h, qty: newQty, avgPrice: parseFloat(newAvg.toFixed(2)) } : h);
        }
        return [...prev, { symbol: stock.symbol, qty, avgPrice: stock.price }];
      });
    }
    setBuySellData(null);
  }, [wallet, portfolio]);

  const handleToggleWatch = useCallback((symbol: string) => {
    if (mode === 'guest') {
      setShowLogin(true);
      return;
    }
    setWatchlist(prev => prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]);
  }, [mode]);

  const handleTabChange = useCallback((tab: string) => {
    if (mode === 'guest' && (tab === 'portfolio' || tab === 'watchlist')) {
      setShowLogin(true);
      return;
    }
    setActiveTab(tab);
  }, [mode]);

  const holding = selectedStock ? portfolio.find(h => h.symbol === selectedStock.symbol) : null;

  return (
    <View style={globalStyles.container}>
      <SafeAreaView style={{ backgroundColor: colors.bg }}>
        <StatusBar />
        <View style={styles.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.logo}><Text style={{ fontWeight: '700', color: colors.bg }}>D</Text></View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>DSE <Text style={{ fontWeight: '400', color: colors.textSub }}>Sim</Text></Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {mode !== 'guest' && mode !== 'premium' && (
              <TouchableOpacity onPress={() => setMode('premium')} style={styles.upgradeBtn}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.bg }}>⭐ Upgrade</Text>
              </TouchableOpacity>
            )}
            {mode === 'premium' && <Badge type="amber" text="⭐ Premium" />}
            {mode === 'guest' ? (
              <TouchableOpacity onPress={() => setShowLogin(true)} style={styles.loginBtn}>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>Login</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, color: colors.textSub }}>Cash</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.gain }}>৳{(wallet / 1000).toFixed(1)}K</Text>
                </View>
                <TouchableOpacity onPress={() => { setMode('guest'); setWallet(100000); setPortfolio([]); setActiveTab('market'); }} style={styles.avatar}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: colors.blue }}>{userName.slice(0, 2).toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <TickerBar />
        <DSEXBar />
      </SafeAreaView>

      {mode === 'guest' && (
        <View style={styles.guestBanner}>
          <Text style={{ fontSize: 18 }}>👁️</Text>
          <Text style={{ flex: 1, fontSize: 12, color: colors.textMuted }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>Guest Mode</Text> — Watching live market. Login to start paper trading with ৳1,00,000!
          </Text>
          <TouchableOpacity onPress={() => setShowLogin(true)} style={[styles.loginBtn, { backgroundColor: colors.gain, borderColor: 'transparent' }]}>
            <Text style={{ fontSize: 12, color: colors.bg, fontWeight: '600' }}>Login Free</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {activeTab === 'market' && <MarketTab mode={mode} watchlist={watchlist} onToggleWatch={handleToggleWatch} onSelectStock={setSelectedStock} onBuy={handleBuy} />}
        {activeTab === 'portfolio' && <PortfolioTab portfolio={portfolio} wallet={wallet} onBuy={handleBuy} onSell={handleSell} />}
        {activeTab === 'watchlist' && <WatchlistTab watchlist={watchlist} onToggleWatch={handleToggleWatch} onSelectStock={setSelectedStock} onBuy={handleBuy} />}
        {activeTab === 'leaderboard' && <LeaderboardTab portfolio={portfolio} wallet={wallet} />}
        {activeTab === 'learn' && <LearnTab />}
      </View>

      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} mode={mode} />

      <LoginModal visible={showLogin} onLogin={handleLogin} onClose={() => { setShowLogin(false); setPendingBuyStock(null); }} />
      {selectedStock && <StockDetailModal visible={!!selectedStock} stock={selectedStock} onClose={() => setSelectedStock(null)} isLoggedIn={mode !== 'guest'} isWatched={watchlist.includes(selectedStock.symbol)} onToggleWatch={handleToggleWatch} onBuy={handleBuy} onSell={handleSell} holding={holding} mode={mode} />}
      {buySellData && <BuySellModal visible={!!buySellData} stock={buySellData.stock} isSell={buySellData.isSell} wallet={wallet} holding={buySellData.holding} onTrade={handleTrade} onClose={() => setBuySellData(null)} />}
    </View>
  );
}

const StatusBar = () => <RNStatusBar barStyle="light-content" />;

const styles = StyleSheet.create({
  topBar: { paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#0D1020' },
  logo: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.blue, justifyContent: 'center', alignItems: 'center' },
  upgradeBtn: { height: 30, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.amber, justifyContent: 'center' },
  loginBtn: { height: 32, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.activeTabBg, justifyContent: 'center', alignItems: 'center' },
  guestBanner: { backgroundColor: colors.card, borderEndWidth: 1, borderColor: '#1A2647', margin: 12, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1 }
});
