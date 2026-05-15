import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar as RNStatusBar, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomNav } from './components/BottomNav';
import { DSEXBar, TickerBar } from './components/HeaderBars';
import { BuySellModal, LoginModal, StockDetailModal } from './components/Modals';
import { Badge } from './components/SharedComponents';
import { StockChartScreen } from './components/StockChartScreen';
import { Holding } from './data/fakeData';
import { LeaderboardTab } from './tabs/LeaderboardTab';
import { LearnTab } from './tabs/LearnTab';
import { MappedStock, MarketTab } from './tabs/MarketTab';
import { PortfolioTab } from './tabs/PortfolioTab';
import { WatchlistTab } from './tabs/WatchlistTab';
import { colors, globalStyles } from './theme';
import { clear as clearStorage, getTokenSync, getUser, init as initStorage, setWallet as saveWallet, setPortfolio as savePortfolio, setWatchlist as saveWatchlist } from './utils/storage';
import { useGetProfileQuery } from './api/services/auth/authApi';
import { useGetHoldingsQuery, useBuyStockMutation, useSellStockMutation } from './api/services/trade/tradeApi';
import { useGetWatchlistQuery, useAddToWatchlistMutation, useRemoveFromWatchlistMutation } from './api/services/watchlist/watchlistApi';

type AppStock = { symbol: string; name: string; sector: string; price: number; change: number; pct: number; vol: number; spark: number[]; dayChart: number[] };

export default function AppContainer() {
  const [mode, setMode] = useState('guest');
  const [activeTab, setActiveTab] = useState('market');
  const [selectedStock, setSelectedStock] = useState<MappedStock | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [buySellData, setBuySellData] = useState<{ stock: MappedStock; isSell: boolean; holding: Holding | null } | null>(null);
  const [pendingBuyStock, setPendingBuyStock] = useState<MappedStock | null>(null);
  const [wallet, setWallet] = useState(100000);
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(['GP', 'SQUAREPH']);
  const [userName, setUserName] = useState('Trader');
  const [tradeError, setTradeError] = useState('');

  const isLoggedIn = mode !== 'guest';

  const { data: profileData } = useGetProfileQuery(undefined, { skip: !isLoggedIn });
  const { data: holdingsData } = useGetHoldingsQuery(undefined, { skip: !isLoggedIn });
  const { data: watchlistData } = useGetWatchlistQuery(undefined, { skip: !isLoggedIn });


  const [buyStock] = useBuyStockMutation();
  const [sellStock] = useSellStockMutation();
  const [addToWatchlist] = useAddToWatchlistMutation();
  const [removeFromWatchlist] = useRemoveFromWatchlistMutation();

  useEffect(() => {
    (async () => {
      await initStorage();
      const token = getTokenSync();
      const userStr = await getUser();
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setMode('free');
          setUserName(user.name || 'Trader');
        } catch { }
      }
    })();
  }, []);

  useEffect(() => {
    if (profileData?.data?.wallet) {
      const w = profileData.data.wallet;
      setWallet(w.balance);
      saveWallet(w.balance);
    }
  }, [profileData]);

  useEffect(() => {
    if (holdingsData?.data) {
      const mapped = holdingsData.data.map(h => ({
        symbol: h.stockCode,
        qty: h.quantity,
        avgPrice: h.avgBuyPrice,
      }));
      setPortfolio(mapped);
      savePortfolio(mapped);
    }
  }, [holdingsData]);

  useEffect(() => {
    if (watchlistData?.data) {
      const codes = watchlistData.data.map(w => w.stockCode);
      setWatchlist(codes);
      saveWatchlist(codes);
    }
  }, [watchlistData]);

  const handleLogin = useCallback((name: string, token?: string, user?: any) => {
    setMode('free');
    setUserName(name || user?.name || 'Trader');
    setShowLogin(false);
    if (pendingBuyStock) {
      setBuySellData({ stock: pendingBuyStock, isSell: false, holding: null });
      setPendingBuyStock(null);
    }
  }, [pendingBuyStock]);

  const handleBuy = useCallback((stock: AppStock) => {
    if (mode === 'guest') {
      setPendingBuyStock(stock as MappedStock);
      setShowLogin(true);
      return;
    }
    setTradeError('');
    const holding = portfolio.find(h => h.symbol === stock.symbol) || null;
    setBuySellData({ stock: stock as MappedStock, isSell: false, holding });
  }, [mode, portfolio]);

  const handleSell = useCallback((stock: AppStock, holding: Holding) => {
    setTradeError('');
    setBuySellData({ stock: stock as MappedStock, isSell: true, holding });
  }, []);

  const handleTrade = useCallback(async (stock: MappedStock, qty: number, isSell: boolean) => {
    setTradeError('');
    try {
      const res = isSell
        ? await sellStock({ stockCode: stock.symbol, quantity: qty, price: stock.price }).unwrap()
        : await buyStock({ stockCode: stock.symbol, quantity: qty, price: stock.price }).unwrap();
      if (res.success) {
        setBuySellData(null);
      }
    } catch (err: any) {
      const msg = err?.data?.message || 'Trade failed';
      setTradeError(msg);
      setTimeout(() => setBuySellData(null), 2000);
    }
  }, [buyStock, sellStock]);

  const handleToggleWatch = useCallback(async (symbol: string) => {
    if (mode === 'guest') {
      setShowLogin(true);
      return;
    }
    const already = watchlist.includes(symbol);
    try {
      if (already) {
        await removeFromWatchlist(symbol).unwrap();
      } else {
        await addToWatchlist({ stockCode: symbol }).unwrap();
      }
    } catch { }
  }, [mode, watchlist, addToWatchlist, removeFromWatchlist]);

  const handleTabChange = useCallback((tab: string) => {
    if (mode === 'guest' && (tab === 'portfolio' || tab === 'watchlist')) {
      setShowLogin(true);
      return;
    }
    setActiveTab(tab);
  }, [mode]);

  const handleLogout = useCallback(() => {
    clearStorage();
    setMode('guest');
    setWallet(100000);
    setPortfolio([]);
    setWatchlist(['GP', 'SQUAREPH']);
    setActiveTab('market');
  }, []);

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
                <TouchableOpacity onPress={handleLogout} style={styles.avatar}>
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
        {activeTab === 'leaderboard' && <LeaderboardTab />}
        {activeTab === 'learn' && <LearnTab />}
        {activeTab === 'chart' && <StockChartScreen />}
      </View>

      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} mode={mode} />

      <LoginModal visible={showLogin} onLogin={handleLogin} onClose={() => { setShowLogin(false); setPendingBuyStock(null); }} />
      {selectedStock && <StockDetailModal visible={!!selectedStock} stock={selectedStock} onClose={() => setSelectedStock(null)} isLoggedIn={mode !== 'guest'} isWatched={watchlist.includes(selectedStock.symbol)} onToggleWatch={handleToggleWatch} onBuy={handleBuy} onSell={handleSell} holding={holding} mode={mode} />}
      {buySellData && <BuySellModal visible={!!buySellData} stock={buySellData.stock} isSell={buySellData.isSell} wallet={wallet} holding={buySellData.holding} onTrade={handleTrade} onClose={() => setBuySellData(null)} error={tradeError} />}
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
