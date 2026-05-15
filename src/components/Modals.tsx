import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGetStockDetailsQuery } from '../api/services/market/marketApi';
import { useLoginMutation, useRegisterMutation } from '../api/services/auth/authApi';
import { setToken, setUser } from '../utils/storage';
import { fmt, fmtVol } from '../data/fakeData';
import { MappedStock } from '../tabs/MarketTab';
import { colors, globalStyles } from '../theme';
import { Badge, Button } from './SharedComponents';
import { SparkLine } from './SparkLine';

const { width, height } = Dimensions.get('window');

interface Holding {
  symbol: string;
  qty: number;
  avgPrice: number;
}

const CloseButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.closeBtn}>
    <Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text>
  </TouchableOpacity>
);

const sectorBadgeType = (sector: string): 'blue' | 'gain' | 'amber' | 'loss' => {
  if (['Banking', 'Finance'].includes(sector)) return 'blue';
  if (['Pharma', 'Food', 'FMCG'].includes(sector)) return 'gain';
  if (['Energy', 'Cement'].includes(sector)) return 'loss';
  return 'amber';
};

interface LoginModalProps {
  visible: boolean;
  onLogin: (name: string, token: string, user: any) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ visible, onLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [isReg, setIsReg] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const isLoading = isRegistering || isLoggingIn;

  const handle = async () => {
    setError('');
    if (!email || !pass) { setError('Email and password are required'); return; }
    if (isReg && !name) { setError('Name is required'); return; }

    try {
      let res;
      if (isReg) {
        res = await register({ name, email, password: pass }).unwrap();
      } else {
        res = await login({ email, password: pass }).unwrap();
      }

      const { token, user } = res.data;
      await setToken(token);
      await setUser(JSON.stringify(user));
      onLogin(user.name || name, token, user);
    } catch (err: any) {
      const msg = err?.data?.message || err?.data?.details?.[0] || 'Something went wrong';
      setError(msg);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>

          {!isReg && (
            <View style={[globalStyles.cardSm, { padding: 14, marginBottom: 20 }]}>
              {[
                ['💰', '৳1,00,000 Virtual Money to trade'],
                ['📊', 'Real-time portfolio tracking'],
                ['⭐', 'Save your watchlist'],
                ['🔔', 'Price alerts & notifications'],
              ].map(([ic, tx]) => (
                <View key={tx} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Text style={{ fontSize: 16 }}>{ic}</Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted }}>{tx}</Text>
                </View>
              ))}
            </View>
          )}

          {isReg && (
            <TextInput style={styles.input} placeholder="Your Name" placeholderTextColor={colors.textSub} value={name} onChangeText={setName} />
          )}
          <TextInput style={styles.input} placeholder="Email address" placeholderTextColor={colors.textSub} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.textSub} secureTextEntry value={pass} onChangeText={setPass} />

          {error ? (
            <Text style={{ color: colors.loss, fontSize: 12, textAlign: 'center', marginBottom: 10 }}>{error}</Text>
          ) : null}

          {isLoading ? (
            <View style={{ height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
              <ActivityIndicator size="small" color={colors.blue} />
            </View>
          ) : (
            <Button title={isReg ? 'Create Free Account →' : 'Login →'} onPress={handle} style={{ height: 48, marginBottom: 12 }} />
          )}

          <TouchableOpacity onPress={() => setIsReg(!isReg)}>
            <Text style={{ textAlign: 'center', fontSize: 13, color: colors.textSub }}>
              {isReg ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={{ color: colors.blue }}>{isReg ? 'Login' : 'Register Free'}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
            <Text style={{ textAlign: 'center', fontSize: 12, color: colors.textSub }}>Continue as Guest →</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* </View> */}
    </Modal >
  );
};

interface StockDetailModalProps {
  visible: boolean;
  stock: MappedStock | null;
  symbol?: string;
  onClose: () => void;
  isLoggedIn: boolean;
  isWatched: boolean;
  onToggleWatch: (symbol: string) => void;
  onBuy: (stock: MappedStock) => void;
  onSell: (stock: MappedStock, holding: Holding) => void;
  holding?: Holding | null;
  mode: string;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  visible, stock, symbol, onClose, isLoggedIn, isWatched,
  onToggleWatch, onBuy, onSell, holding,
}) => {
  const [chartPeriod, setChartPeriod] = useState('1D');

  const querySymbol = symbol || stock?.symbol || '';
  const { data: stockDetailsResponse, isLoading, isError } = useGetStockDetailsQuery(querySymbol, {
    skip: !visible || !querySymbol,
  });

  if (!stock && !symbol) return null;

  const stockDetails = stockDetailsResponse?.data;

  const displayStock = stockDetails || stock;

  if (isLoading) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { height: 300, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={colors.blue} />
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 12 }}>Loading stock details...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (isError || !displayStock) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { height: 300, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
            <Text style={{ color: colors.loss, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              {isError ? 'Failed to load data' : 'No data available'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
              {isError ? 'Please try again later' : 'Stock details not found'}
            </Text>
            <CloseButton onPress={onClose} />
          </View>
        </View>
      </Modal>
    );
  }

  const s = displayStock;
  const isGain = s.pct >= 0;

  const sparkData = React.useMemo(() => {
    if (s.spark && s.spark.length > 1) return s.spark;
    return [];
  }, [s.spark]);

  const xLabels = React.useMemo(() => {
    if (sparkData.length === 0) return [];
    if (sparkData.length >= 15) {
      const count = 4;
      const step = Math.floor(sparkData.length / count);
      return Array.from({ length: count }, (_, i) => {
        const day = (i + 1) * step;
        return `Day ${day}`;
      });
    }
    return ['10:00', '11:00', '12:00', '13:00', '14:00', '14:30'];
  }, [sparkData.length]);

  const plValue = holding ? (s.price - holding.avgPrice) * holding.qty : 0;
  const plPercent = holding ? ((s.price - holding.avgPrice) / holding.avgPrice) * 100 : 0;

  const statRows = [
    { label: 'Volume', val: fmtVol(s.vol) },
    { label: 'Turnover', val: `৳${s.value.toFixed(2)}Cr` },
    { label: 'Trades', val: s.trade.toLocaleString() },
    { label: 'Day High', val: s.high > 0 ? `৳${fmt(s.high)}` : '—' },
    { label: 'Day Low', val: s.low > 0 ? `৳${fmt(s.low)}` : '—' },
    { label: 'Prev Close', val: `৳${fmt(s.ycp)}` },
    { label: 'Open', val: s.open > 0 ? `৳${fmt(s.open)}` : '—' },
    { label: 'Change ৳', val: `${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)}` },
    { label: 'Change %', val: `${isGain ? '+' : ''}${s.pct.toFixed(2)}%` },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { maxHeight: height * 0.92 }]}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

            <View style={{ padding: 18, paddingTop: 24, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.blue }}>{s.symbol}</Text>
                    {s.sector && <Badge type={sectorBadgeType(s.sector)} text={s.sector} />}
                    {s.dseIndex > 0 && s.dseIndex <= 50 && (
                      <Badge type="gain" text={`#${s.dseIndex}`} />
                    )}
                  </View>

                  <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 10 }}>{s.name}</Text>

                  <Text style={{ fontSize: 30, fontWeight: '700', color: colors.text }}>
                    ৳{fmt(s.price)}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                      backgroundColor: isGain ? 'rgba(0,208,156,.12)' : 'rgba(255,68,102,.12)',
                    }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: isGain ? colors.gain : colors.loss }}>
                        {isGain ? '+' : ''}{s.change.toFixed(2)} ({isGain ? '+' : ''}{s.pct.toFixed(2)}%)
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textSub }}>vs prev close ৳{fmt(s.ycp)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => onToggleWatch(s.symbol)}
                  style={[styles.closeBtn, { position: 'relative', top: 0, right: 0 }]}>
                  <Text style={{ fontSize: 18, color: isWatched ? '#F59E0B' : colors.textMuted }}>★</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ paddingHorizontal: 18, paddingTop: 10, flexDirection: 'row', gap: 4 }}>
              {['1D', '1W', '1M', '3M', '1Y'].map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setChartPeriod(p)}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8,
                    backgroundColor: chartPeriod === p ? colors.activeTabBg : 'transparent',
                  }}>
                  <Text style={{ fontSize: 12, color: chartPeriod === p ? colors.blue : colors.textSub }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ paddingHorizontal: 18, paddingVertical: 14 }}>
              {sparkData.length > 0 ? (
                <View>
                  <SparkLine data={sparkData} positive={isGain} w={width - 36} h={140} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    {xLabels.map(t => (
                      <Text key={t} style={{ fontSize: 9, color: colors.textSub }}>{t}</Text>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={{ height: 140, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: colors.textSub, fontSize: 13 }}>Chart unavailable</Text>
                </View>
              )}
            </View>

            <View style={{ paddingHorizontal: 18, paddingBottom: 14 }}>
              <Text style={{ fontSize: 11, color: colors.textSub, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, fontWeight: '600' }}>
                Market Data
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {statRows.map(row => (
                  <View key={row.label} style={[globalStyles.cardSm, { padding: 10, width: (width - 60) / 3 }]}>
                    <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 3 }}>{row.label}</Text>
                    <Text style={{
                      fontSize: 13, fontWeight: '600',
                      color: row.label === 'Change ৳' || row.label === 'Change %'
                        ? isGain ? colors.gain : colors.loss
                        : colors.text,
                    }}>
                      {row.val}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {sparkData.length > 0 && (
              <View style={{ paddingHorizontal: 18, paddingBottom: 14 }}>
                <Text style={{ fontSize: 11, color: colors.textSub, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, fontWeight: '600' }}>
                  Spark Data
                </Text>
                <View style={[globalStyles.cardSm, { padding: 12 }]}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {sparkData.map((val, idx) => (
                      <View key={idx} style={{
                        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
                        backgroundColor: colors.card,
                      }}>
                        <Text style={{ fontSize: 12, color: colors.text, fontWeight: '500' }}>
                          {val.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {holding && (
              <View style={{
                marginHorizontal: 18, marginBottom: 14, padding: 14,
                backgroundColor: '#131829', borderRadius: 12,
                borderWidth: 1, borderColor: colors.border,
              }}>
                <Text style={{ fontSize: 11, color: colors.textSub, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600' }}>
                  Your Position
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>Shares</Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{holding.qty}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>Avg Price</Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>৳{fmt(holding.avgPrice)}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>Current Val</Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>৳{fmt(s.price * holding.qty)}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>P&L</Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: plValue >= 0 ? colors.gain : colors.loss }}>
                      {plValue >= 0 ? '+' : ''}৳{fmt(Math.abs(plValue))}
                    </Text>
                    <Text style={{ fontSize: 10, color: plValue >= 0 ? colors.gain : colors.loss }}>
                      ({plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%)
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={{ paddingHorizontal: 18, paddingBottom: 36, flexDirection: 'row', gap: 10 }}>
              <Button
                title={isLoggedIn ? 'Buy' : 'Login to Trade'}
                onPress={() => { onClose(); onBuy(stock as MappedStock); }}
                style={{ flex: 1, height: 48 }}
              />
              {holding && (
                <Button
                  title="Sell"
                  onPress={() => { onClose(); onSell(stock as MappedStock, holding); }}
                  type="red"
                  style={{ flex: 1, height: 48 }}
                />
              )}
            </View>

          </ScrollView>

          <CloseButton onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

interface BuySellModalProps {
  visible: boolean;
  stock: MappedStock | null;
  isSell: boolean;
  wallet: number;
  holding: Holding | null;
  onTrade: (stock: MappedStock, qty: number, isSell: boolean) => Promise<void>;
  onClose: () => void;
  error?: string;
}

export const BuySellModal: React.FC<BuySellModalProps> = ({
  visible, stock, isSell, wallet, holding, onTrade, onClose, error,
}) => {
  const [qty, setQty] = useState(1);
  const [trading, setTrading] = useState(false);
  if (!stock) return null;

  const maxBuy = Math.floor(wallet / stock.price);
  const maxSell = holding?.qty || 0;
  const max = isSell ? maxSell : maxBuy;
  const cost = qty * stock.price;
  const fee = cost * 0.005;
  const canTrade = isSell
    ? qty > 0 && qty <= maxSell
    : qty > 0 && (cost + fee) <= wallet;

  const setPercent = (pct: number) =>
    setQty(Math.max(1, Math.round(max * pct / 100)));

  const handleTrade = async () => {
    if (!canTrade || trading) return;
    setTrading(true);
    await onTrade(stock, qty, isSell);
    setTrading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <CloseButton onPress={onClose} />
          <ScrollView bounces={false}>
            <View style={{ padding: 22 }}>

              <View style={{ marginBottom: 20, marginTop: 8 }}>
                <Text style={{ fontSize: 11, color: isSell ? colors.loss : colors.gain, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 }}>
                  {isSell ? '● SELL ORDER' : '● BUY ORDER'}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{stock.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Text style={{ fontSize: 13, color: colors.blue, fontWeight: '600' }}>{stock.symbol}</Text>
                  <Text style={{ fontSize: 13, color: colors.textSub }}>LTP ৳{fmt(stock.price)}</Text>
                  <Badge
                    type={stock.pct >= 0 ? 'gain' : 'loss'}
                    text={`${stock.pct >= 0 ? '+' : ''}${stock.pct.toFixed(2)}%`}
                  />
                </View>
              </View>

              <View style={[globalStyles.card, { padding: 14, marginBottom: 18, flexDirection: 'row', justifyContent: 'space-between' }]}>
                <View>
                  <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>
                    {isSell ? 'Shares you own' : 'Available Cash'}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.gain }}>
                    {isSell ? `${maxSell} shares` : `৳${fmt(wallet)}`}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, color: colors.textSub, marginBottom: 2 }}>
                    {isSell ? 'Avg Buy Price' : 'Max Buy'}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {isSell
                      ? (holding ? `৳${fmt(holding.avgPrice)}` : '—')
                      : `${maxBuy} shares`}
                  </Text>
                </View>
              </View>

              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 12, color: colors.textSub, marginBottom: 8 }}>Quantity (shares)</Text>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => setQty(q => Math.max(1, q - 1))} style={styles.qtyBtn}>
                    <Text style={{ fontSize: 20, color: colors.text }}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, { flex: 1, textAlign: 'center', marginVertical: 0, height: 48, fontSize: 20, fontWeight: '700' }]}
                    keyboardType="numeric"
                    value={String(qty)}
                    onChangeText={t => setQty(Math.max(1, Math.min(max, parseInt(t) || 1)))}
                  />
                  <TouchableOpacity onPress={() => setQty(q => Math.min(max, q + 1))} style={styles.qtyBtn}>
                    <Text style={{ fontSize: 20, color: colors.text }}>+</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                  {[25, 50, 75, 100].map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPercent(p)}
                      style={[styles.qtyBtn, { flex: 1, height: 32 }]}>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>{p}%</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[globalStyles.card, { padding: 14, marginBottom: 18 }]}>
                {[
                  { label: 'Price per share', val: `৳${fmt(stock.price)}`, color: colors.text },
                  { label: 'Quantity', val: String(qty), color: colors.text },
                  { label: 'Subtotal', val: `৳${fmt(cost)}`, color: colors.text },
                  { label: 'Brokerage (0.5%)', val: `−৳${fmt(fee)}`, color: colors.loss },
                ].map(r => (
                  <View key={r.label} style={styles.row}>
                    <Text style={{ fontSize: 13, color: colors.textSub }}>{r.label}</Text>
                    <Text style={{ fontSize: 13, color: r.color }}>{r.val}</Text>
                  </View>
                ))}
                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginVertical: 10 }} />
                <View style={styles.row}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                    {isSell ? 'You Receive' : 'Total Cost'}
                  </Text>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: isSell ? colors.gain : colors.text }}>
                    ৳{fmt(isSell ? cost - fee : cost + fee)}
                  </Text>
                </View>

                {isSell && holding && (
                  <>
                    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginVertical: 10 }} />
                    <View style={styles.row}>
                      <Text style={{ fontSize: 12, color: colors.textSub }}>Est. P&L on this sale</Text>
                      <Text style={{
                        fontSize: 13, fontWeight: '600',
                        color: (stock.price - holding.avgPrice) >= 0 ? colors.gain : colors.loss,
                      }}>
                        {(stock.price - holding.avgPrice) >= 0 ? '+' : ''}
                        ৳{fmt((stock.price - holding.avgPrice) * qty)}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <Button
                title={trading ? 'Processing...' : isSell
                  ? `Sell ${qty} ${stock.symbol} @ ৳${fmt(stock.price)}`
                  : `Buy ${qty} ${stock.symbol} for ৳${fmt(cost + fee)}`}
                onPress={handleTrade}
                type={isSell ? 'red' : 'primary'}
                disabled={!canTrade || trading}
                style={{ height: 52 }}
              />
              {trading && (
                <View style={{ marginTop: 8, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.blue} />
                </View>
              )}
              {error ? (
                <Text style={{ fontSize: 12, color: colors.loss, textAlign: 'center', marginTop: 8 }}>
                  {error}
                </Text>
              ) : null}
              {!canTrade && !trading && !isSell && (
                <Text style={{ fontSize: 12, color: colors.loss, textAlign: 'center', marginTop: 8 }}>
                  Insufficient balance (need ৳{fmt(cost + fee - wallet)} more)
                </Text>
              )}
              {!canTrade && !trading && isSell && (
                <Text style={{ fontSize: 12, color: colors.loss, textAlign: 'center', marginTop: 8 }}>
                  You only own {maxSell} shares
                </Text>
              )}

            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(8,12,24,0.88)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.modalContent, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: height * 0.92 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, color: colors.text, paddingHorizontal: 14, height: 48, marginBottom: 10 },
  closeBtn: { position: 'absolute', top: 18, right: 18, width: 34, height: 34, borderRadius: 8, backgroundColor: '#131829', borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  qtyBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 8, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
});
